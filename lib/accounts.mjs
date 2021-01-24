import Fuse from "fuse.js";
import inquirer from "inquirer";
import { buildError } from "./error.mjs";
import { listAccounts, listAccountRoles, getRoleCredentials, createAWSClient } from "./aws.mjs";

export const chooseAccount = async (accessToken, region) => {
  const accounts = await getAccounts(accessToken, createAWSClient(region));
  const fuse = new Fuse(accounts, { threshold: 0.4, keys: ["accountName"] });
  const answer = await inquirer.prompt({
    type: "autocomplete",
    name: "accountName",
    message: "Select the AWS account you want to authenticate with:",
    pageSize: 20,
    source: (result, input) => {
      //TODO: sort alphabetically if no input
      return input
        ? fuse.search(input).map((result) => result.item.accountName)
        : accounts.map((account) => account.accountName);
    },
  });
  return accounts.find((account) => account.accountName === answer.accountName);
};

export const chooseRole = async (accessToken, accountId, region) => {
  const roles = await getAccountRoles(accessToken, accountId, createAWSClient(region));
  const fuse = new Fuse(roles, { threshold: 0.4, keys: ["roleName"] });
  const answer = await inquirer.prompt({
    type: "autocomplete",
    name: "roleName",
    message: "Select the account role you wish to assume:",
    pageSize: 20,
    source: (result, input) => {
      //TODO: sort alphabetically if no input
      return input
        ? fuse.search(input).map((result) => result.item.roleName)
        : roles.map((role) => role.roleName);
    },
  });
  return roles.find((role) => role.roleName === answer.roleName);
};

export const findAccountByName = async (accessToken, accountName, region) => {
  const accounts = await getAccounts(accessToken, createAWSClient(region));
  const match = accounts.find((account) => account.accountName === accountName);
  if (!match) {
    throw buildError("ERR_ACCOUNT_NOT_FOUND");
  }
  return match;
};

export const findRoleByName = async (accessToken, roleName, accountId, region) => {
  const roles = await getAccountRoles(accessToken, accountId, createAWSClient(region));
  const match = roles.find((role) => role.roleName === roleName);
  if (!match) {
    throw buildError("ERR_ROLE_NOT_FOUND");
  }
  return match;
};

const getAccounts = async (accessToken, AWSClient, nextToken = null, accountListAcc = []) => {
  const accounts = await listAccounts(accessToken, nextToken, AWSClient);
  const accountList = [...accountListAcc, ...accounts.accountList];
  return "nextToken" in accounts && accounts.nextToken != null
    ? await getAccounts(accessToken, AWSClient, accounts.nextToken, accountList)
    : accountList;
};

const getAccountRoles = async (
  accessToken,
  accountId,
  AWSClient,
  nextToken = null,
  roleListAcc = []
) => {
  const roles = await listAccountRoles(accessToken, accountId, nextToken, AWSClient);
  const roleList = [...roleListAcc, ...roles.roleList];
  return "nextToken" in roles && roles.nextToken != null
    ? await getAccountRoles(accessToken, accountId, AWSClient, roles.nextToken, roleList)
    : roleList;
};

export const getCredentials = async (accessToken, accountId, roleName, region) =>
  await getRoleCredentials(accessToken, accountId, roleName, createAWSClient(region));
