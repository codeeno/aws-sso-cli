import readline from "readline";
import chalk from "chalk"

export const getUnixTimestamp = Math.floor(Date.now() / 1000);

export const keypress = async (keyName) => {
  console.log('', '\n', chalk.bold.green(`Press ${keyName.toUpperCase()} to continue`));
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
