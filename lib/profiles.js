import inquirer from "inquirer";
import chalk from "chalk";
import autocomplete from "inquirer-autocomplete-prompt";
import { buildError } from "./error.js";

const prompt = inquirer.createPromptModule({ output: process.stderr });
prompt.registerPrompt("autocomplete", autocomplete);

const regions = [
  "us-east-2",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "af-south-1",
  "ap-east-1",
  "ap-south-1",
  "ap-northeast-3",
  "ap-northeast-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ca-central-1",
  "cn-north-1",
  "cn-northwest-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-south-1",
  "eu-west-3",
  "eu-north-1",
  "me-south-1",
  "sa-east-1",
];

export const addProfile = (configstore) =>
  prompt([
    {
      type: "input",
      name: "profileName",
      message: "Name of your SSO profile:",
    },
    {
      type: "autocomplete",
      name: "region",
      message: "Select the region where your AWS SSO service is running.",
      source: (result, input) => {
        return regions.filter((str) => str.includes(input || ""));
      },
    },
    {
      type: "input",
      name: "startUrl",
      message: "Your SSO start URL (e.g. https://<your-alias>.awsapps.com/start):",
      validate: (value) => {
        return value.match(/^https?:\/\/[\w.\-]+\.awsapps.com\/start$/g)
          ? true
          : "Invalid start URL.";
      },
    },
  ]).then(({ profileName, region, startUrl }) => {
    configstore.set({
      [profileName]: {
        region: region,
        startUrl: startUrl,
      },
    });
  });

export const deleteProfile = (configstore) =>
  prompt({
    type: "list",
    name: "profile",
    message: "Select the profile you wish to remove.",
    choices: Object.keys(configstore.all),
  }).then(({ profile }) => {
    console.error(profile);
    if (!(profile in configstore.all)) {
      throw buildError("ERR_INVALID_PROFILE");
    }
    configstore.delete(profile);
  });

export const listProfiles = (configstore) => Object.keys(configstore.all);

export const chooseProfile = async (configstore) => {
  const profileNames = Object.keys(configstore.all);
  if (!configstore || !profileNames.length) {
    throw buildError("ERR_NO_PROFILE");
  } else if (profileNames.length === 1) {
    console.error(chalk.green("Defaulting to only available SSO profile:", profileNames[0]));
    return profileNames[0];
  } else {
    const answer = await prompt({
      type: "list",
      name: "profile",
      message: "Select the SSO profile.",
      choices: profileNames,
    });
    return answer.profile;
  }
};

export const loadConfig = (configstore, profileName) => {
  if (!(profileName in configstore.all)) {
    throw buildError("ERR_INVALID_PROFILE");
  }
  return configstore.get(profileName);
};

export const updateConfig = (configstore, profileName, newConfig) => {
  if (!(profileName in configstore.all)) {
    throw buildError("ERR_INVALID_PROFILE");
  }
  return configstore.set(`${profileName}`, newConfig);
};
