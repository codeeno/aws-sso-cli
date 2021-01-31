import AWS from "aws-sdk";
import os from "os";

export const createAWSClient = (region) => ({
  SSOOIDC: new AWS.SSOOIDC({ region: region }),
  SSO: new AWS.SSO({ region: region }),
});

export const registerClient = async (AWSClient) =>
  await AWSClient.SSOOIDC.registerClient({
    clientName: os.hostname(),
    clientType: "public",
  }).promise();

export const startDeviceAuthorization = async (clientId, clientSecret, startUrl, AWSClient) =>
  await AWSClient.SSOOIDC.startDeviceAuthorization({
    clientId: clientId,
    clientSecret: clientSecret,
    startUrl: startUrl,
  }).promise();

export const createToken = async (clientId, clientSecret, deviceCode, AWSClient) =>
  await AWSClient.SSOOIDC.createToken({
    clientId: clientId,
    clientSecret: clientSecret,
    deviceCode: deviceCode,
    grantType: "urn:ietf:params:oauth:grant-type:device_code",
  }).promise();

export const listAccounts = async (accessToken, nextToken, AWSClient) =>
  await AWSClient.SSO.listAccounts({
    maxResults: 500,
    accessToken: accessToken,
    nextToken: nextToken,
  }).promise();

export const listAccountRoles = async (accessToken, accountId, nextToken, AWSClient) =>
  await AWSClient.SSO.listAccountRoles({
    accessToken: accessToken,
    accountId: accountId,
    nextToken: nextToken,
  }).promise();

export const getRoleCredentials = async (accessToken, accountId, roleName, AWSClient) =>
  await AWSClient.SSO.getRoleCredentials({
    accessToken: accessToken,
    accountId: accountId,
    roleName: roleName,
  }).promise();
