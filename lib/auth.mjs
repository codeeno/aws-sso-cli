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
  const deviceAuth = await startDeviceAuthorization(
    clientId,
    clientSecret,
    config.get(`${profile}.startUrl`)
  );

  const verificationUri = deviceAuth.verificationUriComplete;
  console.log("Attempting to open:", verificationUri);
  await open(verificationUri);
  await keypress("enter");

  const token = await createToken(clientId, clientSecret, deviceAuth.deviceCode);
  config.set(`${profile}.token`, {
    ...token,
    tokenExpiresAt: getUnixTimestamp + token.expiresIn,
  });
};
