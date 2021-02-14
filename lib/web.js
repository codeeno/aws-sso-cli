import axios from "axios";
import os from "os";
import ora from "ora";
import { buildError } from "./error.js";

const buildURLQuery = (obj) =>
  Object.entries(obj)
    .map((pair) => pair.map(encodeURIComponent).join("="))
    .join("&");

export const getSigninUrl = async (accessKeyId, secretAccessKey, sessionToken) => {
  const federationUrl = "https://signin.aws.amazon.com/federation";
  const destinationUrl = `https://console.aws.amazon.com/console/home`;

  try {
    const spinner = ora("Fetching sign-in URL..").start();
    const response = await axios.get(federationUrl, {
      params: {
        Action: "getSigninToken",
        Session: JSON.stringify({
          sessionId: accessKeyId,
          sessionKey: secretAccessKey,
          sessionToken: sessionToken,
        }),
      },
    });

    const urlParams = buildURLQuery({
      Action: "login",
      Issuer: encodeURI(os.hostname),
      Destination: encodeURI(destinationUrl),
      SigninToken: encodeURI(response?.data?.SigninToken),
    });

    spinner.stop();
    return `${federationUrl}?${urlParams}`;
  } catch (err) {
    throw buildError("ERR_GET_SIGNIN_URL", `${err}`);
  }
};
