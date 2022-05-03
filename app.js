#!/usr/bin/env node

import yargs from "yargs";
import chalk from "chalk";
import open from "open";
import { hideBin } from "yargs/helpers";
import Configstore from "configstore";
import { getSigninUrl } from "./lib/web.js";
import { refreshCredentials } from "./lib/auth.js";
import { handleError } from "./lib/error.js";
import {
  addProfile,
  chooseProfile,
  deleteProfile,
  listProfiles,
  loadConfig,
  updateConfig,
} from "./lib/profiles.js";
import {
  chooseAccount,
  chooseRole,
  getCredentials,
  findAccountByName,
  findRoleByName,
} from "./lib/accounts.js";

const configstore = new Configstore("aws-sso-cli");

const signInHandler = async (argv) => {
  try {
    const profile = "profile" in argv ? argv.profile : await chooseProfile(configstore);

    const config = await refreshCredentials(loadConfig(configstore, profile), argv.forceNewToken);
    updateConfig(configstore, profile, config);
    const {
      token: { accessToken },
      region,
    } = config;

    const { accountId } =
      "account" in argv
        ? await findAccountByName(accessToken, argv.account, region)
        : await chooseAccount(accessToken, region);

    const { roleName } =
      "role" in argv
        ? await findRoleByName(accessToken, argv.role, accountId, region)
        : await chooseRole(accessToken, accountId, region);

    const {
      roleCredentials: { accessKeyId, secretAccessKey, sessionToken },
    } = await getCredentials(accessToken, accountId, roleName, region);

    if (argv.web && typeof process.env.BROWSER !== 'undefined') {
      open(await getSigninUrl(accessKeyId, secretAccessKey, sessionToken), {app: process.env.BROWSER});
    } else if (argv.web) {
      open(await getSigninUrl(accessKeyId, secretAccessKey, sessionToken));
    } else {
      console.log(
        "",
        `export AWS_ACCESS_KEY_ID=${accessKeyId}`,
        "\n",
        `export AWS_SECRET_ACCESS_KEY=${secretAccessKey}`,
        "\n",
        `export AWS_SESSION_TOKEN=${sessionToken}`
      );
    }
    console.error(chalk.bold.green("\nAll set!"));
  } catch (err) {
    handleError(err);
  }
  process.exit(0);
};

const addProfileHandler = async () => {
  try {
    await addProfile(configstore);
    console.error("Profile added.");
  } catch (err) {
    handleError(err);
  }
};

const deleteProfileHandler = async () => {
  try {
    await deleteProfile(configstore);
    console.error("Profile successfully deleted.");
  } catch (err) {
    handleError(err);
  }
};

const listProfilesHandler = () => {
  try {
    const profiles = listProfiles(configstore);
    if (profiles.length === 0) {
      console.error("No profiles configured yet.");
      return;
    }
    console.error("Profiles:", `\n\n* ${profiles.join("\n* ")}`);
  } catch (err) {
    handleError(err);
  }
};

yargs(hideBin(process.argv))
  .scriptName("aws-sso-cli")
  .usage("Usage: $0 [options]")
  .command({
    command: "add-profile",
    desc: "Add a new SSO profile",
    handler: addProfileHandler,
  })
  .command({
    command: "delete-profile",
    desc: "Remove an SSO profile",
    handler: deleteProfileHandler,
  })
  .command({
    command: "list-profiles",
    desc: "List all currently configured profiles",
    handler: listProfilesHandler,
  })
  .command({
    command: "$0",
    desc: "Sign in to an AWS account using AWS SSO",
    handler: signInHandler,
  })
  .option("p", {
    alias: "profile",
    describe: "The SSO profile to use",
    type: "string",
  })
  .option("a", {
    alias: "account",
    describe: "The name of the account you wish to sign into",
    type: "string",
  })
  .option("r", {
    alias: "role",
    describe: "The role you wish to assume for the specified account",
    type: "string",
  })
  .option("f", {
    alias: "force-new-token",
    describe: "Force fetch a new access token for AWS SSO",
    type: "boolean",
  })
  .option("w", {
    alias: "web",
    describe: "Open selected AWS account in your web browser",
    type: "boolean",
  })
  .wrap(90)
  .help("help", "Show help.").argv;
