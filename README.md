# AWS SSO CLI

## Description

Switch between temporary AWS SSO credentials of all your AWS accounts using the command-line. Using the official AWS Cli v2, it is required to create a profile for _each_ account, which is not practical if you're working with a big (growing) list of accounts and/or multiple instances of AWS SSO.

![Demo](demo.gif)

## Features

- Generates temporary AWS SSO credentials from the commandline
- Configure SSO profiles for jumping between different instances of AWS SSO
- Re-authenticates whenever the access token becomes invalid
- Interactively prompts for Profiles/Accounts/Roles if not supplied through options
- Ability to open web console of selected account

## Requirements

- Node.js **v14** or higher

## Setup

Install with npm:

```bash
npm install -g aws-sso-cli
```

By default, the utility prints out the `export` statements for the credentials (similar to the web frontend). If you want to have them exported automatically, you can set up a function in your .bashrc or .zshrc file that can run the export commands like so:

```bash
aws-sso-cli() {
  aws-sso-cli "$@" | while read -r line; do
    if [[ $line =~ ^export ]]; then
      eval $line
    fi
  done
}
```

## Usage

```
Usage: aws-sso-cli [options]

Commands:
  aws-sso-cli add-profile     Add a new SSO profile
  aws-sso-cli delete-profile  Remove an SSO profile
  aws-sso-cli                 Sign in to an AWS account using AWS SSO            [default]

Options:
      --version          Show version number                                     [boolean]
  -p, --profile          The SSO profile to use.                                  [string]
  -a, --account          The name of the account you wish to sign into.           [string]
  -r, --role             The role you wish to assume for the specified account.   [string]
  -f, --force-new-token  Force fetch a new access token for AWS SSO.             [boolean]
  -w, --web              Open selected AWS account in your web browser.          [boolean]
      --help             Show help.                                              [boolean]
```
