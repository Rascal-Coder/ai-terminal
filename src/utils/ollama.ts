import os from "node:os";
import { colorize } from "./color";
import { exec } from "child_process";
import { promisify } from "util";
import { confirm } from "@clack/prompts";
import { spawn } from "child_process";
import { openBrowser } from "./common";
import { oraSpinner } from "./spinner";

const execPromise = promisify(exec);
const platform: NodeJS.Platform = os.platform();
const downloadUrlMap: Record<string, string> = {
  win32: "https://ollama.com/download/OllamaSetup.exe",
  darwin: "https://ollama.com/download/Ollama-darwin.zip",
};

const allowedPlatforms = Object.keys(downloadUrlMap);

const getOllamaDownloadUrl = (): string | null => {
  if (allowedPlatforms.includes(platform)) {
    return downloadUrlMap[platform];
  } else {
    console.error(colorize("Unsupported platform:", "red"), platform);
    return null;
  }
};

const getOllamaServeEndpoint = async (): Promise<string | null> => {
  try {
    let pidCommand = "";
    let portCommand = "";

    // 根据操作系统选择适当的命令
    if (process.platform === "win32") {
      pidCommand = 'tasklist /fi "imagename eq ollama.exe" /fo csv /nh';
      portCommand = "netstat -ano | findstr LISTENING | findstr ";
    } else if (process.platform === "darwin") {
      pidCommand = 'pgrep -f "ollama serve"';
      portCommand = "lsof -i -P -n | grep LISTEN | grep ";
    } else {
      console.error("Unsupported platform:", process.platform);
      return null;
    }

    // 查询 ollama serve 的 PID
    const { stdout: pidOutput } = await execPromise(pidCommand);
    const pidMatch = pidOutput.trim().match(/\d+/);
    if (!pidMatch) {
      return null;
    }
    const pid = pidMatch[0];

    // 查询该 PID 对应的端口号
    const { stdout } = await execPromise(`${portCommand}${pid}`);
    const stdoutInput = stdout.trim().match(/\d+$/)?.input;

    if (stdoutInput) {
      const ipEndpoint = stdoutInput.match(
        /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}\b/
      );
      const ollamaServeEndpoint = `http://${ipEndpoint}`;
      return ollamaServeEndpoint;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving ollama serve:", error);
    return null;
  }
};

const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const { stdout } = await execPromise("ollama --version");
    console.log(colorize(`\n${stdout.trim()}`, "bgCyan"));
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        colorize(`ollama is not available: ${error.message}`, "red")
      );
    } else {
      console.error(
        colorize("Unknown error checking ollama availability", "red")
      );
    }
    return false;
  }
};

const isOllamaServeRunning = async (): Promise<boolean> => {
  try {
    if (platform === "win32") {
      const { stdout } = await execPromise("tasklist");
      return stdout.toLowerCase().includes("ollama.exe");
    } else {
      const { stdout } = await execPromise("pgrep -f 'ollama serve'");
      return stdout.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
};

export const initOllama = async () => {
  const initSpinner = oraSpinner();

  initSpinner.start("Check Ollama available...");
  const available = await isOllamaAvailable();

  if (available) {
    // console.log(colorize("Ollama is available.", "green"));
    initSpinner.succeed("Ollama is available.");
    const running = await isOllamaServeRunning();
    if (!running) {
      // console.log(colorize("Starting ollama serve...", "green"));
      initSpinner.start("Starting ollama serve...");
      const ollamaProcessHelper = spawn("node", ["dist/startOllamaServe.js"], {
        detached: true,
        stdio: "ignore",
      });
      const OLLAMA_SERVE_ENDPOINT = await getOllamaServeEndpoint();
      console.log(
        colorize(`\n🚀 ~ OllamaServeEndpoint at ${OLLAMA_SERVE_ENDPOINT}`, "cyan")
      );
      initSpinner.succeed("Success init ollama !");
      ollamaProcessHelper.unref();
    } else {
      const OLLAMA_SERVE_ENDPOINT = await getOllamaServeEndpoint();
      console.log(
        colorize(`🚀 ~ OllamaServeEndpoint at ${OLLAMA_SERVE_ENDPOINT}`, "cyan")
      );
      initSpinner.succeed("Ollama is already running.");
    }
  } else {
    initSpinner.fail("Ollama is not available.");
    const isDownloadOllama = await confirm({
      message: "Do you want to download ollama?",
      initialValue: true,
    });

    if (isDownloadOllama) {
      const url = getOllamaDownloadUrl();
      if (url) {
        openBrowser(url);
      }
    } else {
      console.log(colorize("\nBye!", "red"));
      process.exit();
    }
  }
};
