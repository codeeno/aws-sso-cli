import Configstore from "configstore";
import { addProfile, chooseProfile } from "./lib/profiles.mjs";
import { refreshToken, refreshClient, clientIsValid, tokenIsValid } from "./lib/auth.mjs";

const config = new Configstore("aws-sso-switcher");

const isEmptyConfig = (config) => !config || !Object.keys(config.all).length;
const checkConfigValidity = async () => {
  if (!clientIsValid(config, profile)) {
    await refreshClient(config, profile);
    await refreshToken(config, profile);
  }

  if (!tokenIsValid(config, profile)) {
    await refreshToken(config, profile);
  }
};

if (isEmptyConfig(config)) {
  console.log("Looks like you haven't set up any profiles yet. Let's create one first.");
  await addProfile(config);
  process.exit(0);
}

const profile = await chooseProfile(config);
await checkConfigValidity();

console.log("all done");
process.exit(0);
