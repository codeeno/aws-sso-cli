#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import Configstore from "configstore";
import { addProfile, chooseProfile, loadConfig } from "./lib/profiles.mjs";
import { refreshCredentials } from "./lib/auth.mjs";
import { handleError } from "./lib/error.mjs";
import { chooseAccount, chooseRole } from "./lib/accounts.mjs";

const configstore = new Configstore("aws-sso-cli");

const signInHandler = async (argv) => {
  try {
    const profile = "profile" in argv ? argv.profile : await chooseProfile(configstore);
    await refreshCredentials(configstore, profile);
    const {token: { accessToken }} = loadConfig(configstore, profile); //prettier-ignore

    const accounts = await chooseAccount(accessToken);
    console.log(accounts);
    //const accounts = await chooseRole(config, profile);
    //console.log(roles);
  } catch (err) {
    handleError(err);
  }

  console.log("all done");
  process.exit(0);
};

const addProfileHandler = async () => {
  try {
    await addProfile(config);
    console.log("All set!");
  } catch (err) {
    console.error("Error while addind new profile:", err);
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
    command: "$0",
    desc: "Sign in to an AWS account using AWS SSO",
    handler: signInHandler,
  })
  .option("p", {
    alias: "profile",
    describe: "The SSO profile to use.",
    type: "string",
  })
  .help("help", "Show help.").argv;
