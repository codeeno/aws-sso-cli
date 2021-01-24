import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import { buildError } from "./error.mjs";
inquirer.registerPrompt("autocomplete", autocomplete);

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
  inquirer
    .prompt([
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
          return value.match(/^https?:\/\/\w+\.awsapps.com\/start$/g) ? true : "Invalid start URL.";
        },
      },
    ])
    .then(({ profileName, region, startUrl }) => {
      //TODO: Check if profile already exists
      configstore.set({
        [profileName]: {
          region: region,
          startUrl: startUrl,
        },
      });
    });

export const deleteProfile = (configstore) =>
  inquirer
    .prompt({
      type: "list",
      name: "profile",
      message: "Select the profile you with to remove.",
      choices: Object.keys(configstore.all),
    })
    .then(({ profile }) => {
      console.log(profile);
      if (!(profile in configstore.all)) {
        throw buildError("ERR_INVALID_PROFILE");
      }
      configstore.delete(profile);
    });

export const chooseProfile = async (configstore) => {
  if (!configstore || !Object.keys(configstore.all).length) {
    throw buildError("ERR_NO_PROFILE");
  }
  const answer = await inquirer.prompt({
    type: "list",
    name: "profile",
    choices: Object.keys(configstore.all),
  });
  return answer.profile;
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
