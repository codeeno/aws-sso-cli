import open from "open";
import { registerClient, startDeviceAuthorization, createToken } from "./sso.mjs";
import { getUnixTimestamp, keypress } from "./helpers.mjs";

export const clientIsValid = (config, profile) =>
  getUnixTimestamp < config.get(`${profile}.client.clientSecretExpiresAt`);

export const tokenIsValid = (config, profile) =>
  getUnixTimestamp < config.get(`${profile}.token.tokenExpiresAt`);

export const refreshClient = async (config, profile) => {
  console.log("Registering new client..");
  const client = await registerClient();
  config.set(`${profile}.client`, client);
};

export const refreshToken = async (config, profile) => {
  console.log("Requesting new token..");
  const { clientId, clientSecret } = config.get(`${profile}.client`);
  const { verificationUriComplete, deviceCode } = await startDeviceAuthorization(
    clientId,
    clientSecret,
    config.get(`${profile}.startUrl`)
  );
  console.log("Attempting to open:", verificationUriComplete);
  await open(verificationUriComplete);
  await keypress("enter");

  const token = await createToken(clientId, clientSecret, deviceCode);
  config.set(`${profile}.token`, {
    ...token,
    tokenExpiresAt: getUnixTimestamp + token.expiresIn,
  });
};

export const refreshCredentials = async (config, profile) => {
  const region = config.get(`${profile}.client.clientSecretExpiresAt`);
  if (!clientIsValid(config, profile)) {
    await refreshClient(config, profile);
    await refreshToken(config, profile);
  }
  if (!tokenIsValid(config, profile)) {
    await refreshToken(config, profile);
  }
};
