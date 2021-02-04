import open from "open";
import chalk from "chalk"
import readline from "readline";
import { createAWSClient, registerClient, startDeviceAuthorization, createToken } from "./aws.js";

const keypress = async (keyName) => {
  console.error('\n', chalk.bold.green(`Press ${keyName.toUpperCase()} to continue`));
  process.stdin.resume();
  readline.emitKeypressEvents(process.stdin);
  return new Promise((resolve) =>
    process.stdin.on("keypress", (str, key) => {
      if (key.name === keyName) {
        resolve();
      }
    })
  );
};

const getUnixTimestamp = Math.floor(Date.now() / 1000);

const isValid = (expiry) => getUnixTimestamp < expiry;

const requestClient = async (AWSClient) => {
  console.error(chalk.green("Registering new client..."));
  return await registerClient(AWSClient);
};

const requestToken = async ({ clientId, clientSecret }, startUrl, AWSClient) => {
  console.error(chalk.green("Requesting new token..."));
  const { verificationUriComplete, deviceCode } = await startDeviceAuthorization(
    clientId,
    clientSecret,
    startUrl,
    AWSClient
  );
  console.error(`Attempting to open: ${chalk.bold.yellow(verificationUriComplete)}`);
  await open(verificationUriComplete);
  await keypress("enter");
  const token = await createToken(clientId, clientSecret, deviceCode, AWSClient);

  return {
    ...token,
    tokenExpiresAt: getUnixTimestamp + token.expiresIn,
  };
};

export const refreshCredentials = async (config, forceNewToken = false) => {
  const AWSClient = createAWSClient(config.region);

  const client = !isValid(config?.client?.clientSecretExpiresAt)
    ? await requestClient(AWSClient)
    : config.client;

  const token = forceNewToken || !isValid(config?.token?.tokenExpiresAt)
    ? await requestToken(client, config.startUrl, AWSClient)
    : config.token;

  return { ...config, client, token };
};
