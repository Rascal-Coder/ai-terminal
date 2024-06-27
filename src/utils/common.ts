import { spawn } from "child_process";
import os from "node:os";
const platform: NodeJS.Platform = os.platform();
// Function to open browser with specified URL
export const openBrowser = (url: string): void => {
  if (platform === "win32") {
    spawn("cmd", ["/c", "start", url], { detached: true });
  } else if (platform === "darwin") {
    spawn("open", [url], { detached: true });
  }
};
