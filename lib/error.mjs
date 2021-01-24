export const buildError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export const handleError = (error) => {
  if (error.code === "ERR_INVALID_PROFILE") {
    console.error(
      "Error: Profile not found in config. Add it using the 'add-profile' command first."
    );
    process.exit(1);
  }
  if (error.code === "ERR_NO_PROFILE") {
    console.error("Error: No profile found. Add one first using the 'add-profile' command.");
    process.exit(1);
  }
  if (error.code === "ERR_ACCOUNT_NOT_FOUND") {
    console.error(
      "Error: The specified account name could not be found within your SSO directory."
    );
    process.exit(1);
  }
  if (error.code === "ERR_ROLE_NOT_FOUND") {
    console.error("Error: The specified role could not be found for the specified AWS account.");
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
};
