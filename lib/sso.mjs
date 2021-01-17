import AWS from "aws-sdk";
import os from "os";

const ec2 = new AWS.EC2({ region: "eu-central-1" });
const sso = new AWS.SSO({ region: "eu-central-1" });
const ssooidc = new AWS.SSOOIDC({ region: "eu-central-1" });

export const registerClient = async () =>
  await ssooidc
    .registerClient({
      clientName: os.hostname(),
      clientType: "public",
    })
    .promise();

export const startDeviceAuthorization = async (clientId, clientSecret, startUrl) =>
  await ssooidc
    .startDeviceAuthorization({
      clientId: clientId,
      clientSecret: clientSecret,
      startUrl: startUrl,
    })
    .promise();

export const createToken = async (clientId, clientSecret, deviceCode) =>
  await ssooidc
    .createToken({
      clientId: clientId,
      clientSecret: clientSecret,
      deviceCode: deviceCode,
      grantType: "urn:ietf:params:oauth:grant-type:device_code",
    })
    .promise();

export const listAccounts = async (accessToken, nextToken) =>
  await sso
    .listAccounts({
      accessToken: accessToken,
      nextToken: nextToken,
    })
    .promise();

export const listAccountRoles = async (accessToken, accountId, nextToken) =>
  await sso
    .listAccountRoles({
      accessToken: accessToken,
      accountId: accountId,
      nextToken: nextToken,
    })
    .promise();

export const getRoleCredentials = async (accessToken, accountId, roleName) =>
  await sso
    .getRoleCredentials({
      accessToken: accessToken,
      accountId: accountId,
      roleName: roleName,
    })
    .promise();
