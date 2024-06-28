import chalk from "chalk";

const error = chalk.bold.red;
const warning = chalk.hex("#FFA500");
const info = chalk.bold.blue;
const success = chalk.bold.green;
const bgerror = chalk.bold.bgRed;
const bgwarn = chalk.bold.bgHex('#FFA500');
const bginfo = chalk.bold.bgBlue;
const bgsuccess = chalk.bold.bgGreen;

export const log = {
  error: (message: string) => {
    console.log(error(`${message}`));
  },
  warning: (message: string) => {
    console.log(warning(`${message}`));
  },
  info: (message: string) => {
    console.log(info(`${message}`));
  },
  success: (message: string) => {
    console.log(success(`${message}`));
  },
  bgerror: (message: string) => {
    console.log(bgerror(`${message}`));
  },
  bgwarn: (message: string) => {
    console.log(bgwarn(`${message}`));
  },
  bginfo: (message: string) => {
    console.log(bginfo(`${message}`));
  },
  bgsuccess: (message: string) => {
    console.log(bgsuccess(`${message}`));
  },
};
