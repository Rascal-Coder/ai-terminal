import { spawn } from "child_process";
import os from "node:os";
/**
 * @description 判断当前运行的操作系统类型。
 * @returns NodeJS.Platform - 操作系统的类型，如 'win32', 'darwin', 'linux' 等。
 */
export const currentPlatform = (): NodeJS.Platform => os.platform();
/**
 * @description 根据操作系统的不同，打开指定的URL。
 * @param url 要打开的URL字符串。
 */
export const openBrowser = (url: string): void => {
  if (currentPlatform() === "win32") {
    spawn("cmd", ["/c", "start", url], { detached: true });
  } else if (currentPlatform() === "darwin") {
    spawn("open", [url], { detached: true });
  }
};
