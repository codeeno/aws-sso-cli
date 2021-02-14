import AWS from "aws-sdk";
import os from "os";
import ora from "ora";

export const createAWSClient = (region) => ({
  SSOOIDC: new AWS.SSOOIDC({ region: region }),
  SSO: new AWS.SSO({ region: region }),
});

export const registerClient = async (AWSClient) => {
  const spinner = ora("Registering client..").start();
  const client = await AWSClient.SSOOIDC.registerClient({
    clientName: os.hostname(),
    clientType: "public",
  }).promise();
  spinner.stop();
  return client;
};

export const startDeviceAuthorization = async (clientId, clientSecret, startUrl, AWSClient) => {
  const spinner = ora("Starting device authorization..").start();
  const auth = await AWSClient.SSOOIDC.startDeviceAuthorization({
    clientId: clientId,
    clientSecret: clientSecret,
    startUrl: startUrl,
  }).promise();
  spinner.stop();
  return auth;
};

export const createToken = async (clientId, clientSecret, deviceCode, AWSClient) => {
  const spinner = ora("Creating token..").start();
  const token = await AWSClient.SSOOIDC.createToken({
    clientId: clientId,
    clientSecret: clientSecret,
    deviceCode: deviceCode,
    grantType: "urn:ietf:params:oauth:grant-type:device_code",
  }).promise();
  spinner.stop();
  return token;
};

export const listAccounts = async (accessToken, nextToken, AWSClient) => {
  const spinner = ora("Fetching accounts..").start();
  const accounts = await AWSClient.SSO.listAccounts({
    maxResults: 500,
    accessToken: accessToken,
    nextToken: nextToken,
  }).promise();
  spinner.stop();
  return accounts;
};

export const listAccountRoles = async (accessToken, accountId, nextToken, AWSClient) => {
  const spinner = ora("Fetching roles..").start();
  const roles = await AWSClient.SSO.listAccountRoles({
    accessToken: accessToken,
    accountId: accountId,
    nextToken: nextToken,
  }).promise();
  spinner.stop();
  return roles;
};

export const getRoleCredentials = async (accessToken, accountId, roleName, AWSClient) => {
  const spinner = ora("Fetching credentials..").start();
  const credentials = await AWSClient.SSO.getRoleCredentials({
    accessToken: accessToken,
    accountId: accountId,
    roleName: roleName,
  }).promise();
  spinner.stop();
  return credentials;
};
