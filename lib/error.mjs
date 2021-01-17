export const buildError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export const handleError = (error) => {
  if (error.code === "ERR_INVALID_PROFILE") {
    console.log("Profile not found in config. Add it using the 'add-profile' command first.");
    process.exit(0);
  }
  if (error.code === "ERR_NO_PROFILE") {
    console.log("No profile found. Add one first using the 'add-profile' command.");
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
};
