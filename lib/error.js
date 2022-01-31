import chalk from "chalk";

export const buildError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const printMessageAndExit = (message) => {
  console.error(message);
  process.exit(1);
};

export const handleError = (error) => {
  switch (error.code) {
    case "ERR_INVALID_PROFILE":
      printMessageAndExit(
        `\nError: Profile not found in config. Add it using the ${chalk.green(
          "'add-profile'"
        )} command first.`
      );
    case "ERR_NO_PROFILE":
      printMessageAndExit(
        `\nError: No profile found. Add one first using the ${chalk.green(
          "'add-profile'"
        )} command.`
      );
    case "ERR_ACCOUNT_NOT_FOUND":
      printMessageAndExit(
        "\nError: The specified account name could not be found within your SSO directory."
      );
    case "ERR_ROLE_NOT_FOUND":
      printMessageAndExit(
        "\nError: The specified role could not be found for the specified AWS account."
      );
    case "ERR_GET_SIGNIN_URL":
      printMessageAndExit(error.message);
    case "UnauthorizedException":
      printMessageAndExit(
        `\n\nError: Despite your token not having expired, it seems to have become invalid for other reasons.\nTo force creating a new token, re-run your command with the ${chalk.green(
          "'-f | --force-new-token'"
        )} flag.`
      );
    default:
      printMessageAndExit(error);
  }
  process.exit(1);
};
