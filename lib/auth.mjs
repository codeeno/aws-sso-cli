import open from "open";
import chalk from "chalk"
import { createAWSClient, registerClient, startDeviceAuthorization, createToken } from "./aws.mjs";
import { getUnixTimestamp, keypress } from "./helpers.mjs";

export const isValid = (expiry) => getUnixTimestamp < expiry;

export const requestClient = async (AWSClient) => {
  console.log(chalk.green("Registering new client..."));
  return await registerClient(AWSClient);
};

export const requestToken = async ({ clientId, clientSecret }, startUrl, AWSClient) => {
  console.log(chalk.green("Requesting new token..."));
  const { verificationUriComplete, deviceCode } = await startDeviceAuthorization(
    clientId,
    clientSecret,
    startUrl,
    AWSClient
  );
  console.log(`Attempting to open: ${chalk.bold.yellow(verificationUriComplete)}`);
  await open(verificationUriComplete);
  await keypress("enter");
  const token = await createToken(clientId, clientSecret, deviceCode, AWSClient);

  return {
    ...token,
    tokenExpiresAt: getUnixTimestamp + token.expiresIn,
  };
};

export const refreshCredentials = async (config) => {
  const AWSClient = createAWSClient(config.region);

  const client = !isValid(config?.client?.clientSecretExpiresAt)
    ? await requestClient(AWSClient)
    : config.client;

  const token = !isValid(config?.token?.tokenExpiresAt)
    ? await requestToken(client, config.startUrl, AWSClient)
    : config.token;

  return { ...config, client, token };
};
