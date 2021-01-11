import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
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

export const addProfile = (config) =>
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
      config.set({
        [profileName]: {
          region: region,
          startUrl: startUrl,
        },
      });
    })
    .catch((err) => {
      console.error("Error while creating profile.", err);
    });

export const chooseProfile = async (config) => {
  const answer = await inquirer.prompt({
    type: "list",
    name: "profile",
    choices: Object.keys(config.all),
  });
  return answer.profile;
};
