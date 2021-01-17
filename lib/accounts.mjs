import { listAccounts, listAccountRoles, getRoleCredentials } from "./sso.mjs";

export const chooseAccount = async (accessToken) => {
  return await getAccounts(accessToken);
};

const getAccounts = async (accessToken, nextToken = null, accountListAcc = []) => {
  const accounts = await listAccounts(accessToken, nextToken);
  const accountList = [...accountListAcc, ...accounts.accountList];

  return "nextToken" in accounts && accounts.nextToken != null
    ? await getAccounts(accessToken, accounts.nextToken, accountList)
    : accountList;
};

export const chooseRole = async (accessToken, accountId) => {
  return await getAccountRoles(accessToken, accountId);
};

const getAccountRoles = async (accessToken, acccountId, nextToken) => {
  const roles = await listAccountRoles(accessToken, accountId, nextToken);
  return roles;
};
