import { exec } from "child_process";
import { promisify } from "util";
import { confirm } from "@clack/prompts";
import { spawn } from "child_process";
import { openBrowser, currentPlatform, oraSpinner, log } from "@/utils";
import { initConfig, setConfig } from "@/core/config";
const execPromise = promisify(exec);
const downloadUrlMap: Record<string, string> = {
  win32: "https://ollama.com/download/OllamaSetup.exe",
  darwin: "https://ollama.com/download/Ollama-darwin.zip",
};

const allowedPlatforms = Object.keys(downloadUrlMap);

const getOllamaDownloadUrl = (): string | null => {
  if (allowedPlatforms.includes(currentPlatform())) {
    return downloadUrlMap[currentPlatform()];
  } else {
    log.error(`Unsupported platform: ${currentPlatform()}`);
    return null;
  }
};

export const getOllamaServeEndpoint = async (): Promise<string | null> => {
  try {
    let pidCommand = "";
    let portCommand = "";

    // 根据操作系统选择适当的命令
    if (currentPlatform() === "win32") {
      pidCommand = 'tasklist /fi "imagename eq ollama.exe" /fo csv /nh';
      portCommand = "netstat -ano | findstr LISTENING | findstr ";
    } else if (currentPlatform() === "darwin") {
      pidCommand = 'pgrep -f "ollama serve"';
      portCommand = "lsof -i -P -n | grep LISTEN | grep ";
    } else {
      log.error(`Unsupported platform: ${currentPlatform()}`);
      return null;
    }

    // 查询 ollama serve 的 PID
    const { stdout: pidOutput } = await execPromise(pidCommand);
    const pidMatch = pidOutput.trim().match(/\d+/);
    if (!pidMatch) {
      return null;
    }
    const pid = pidMatch[0];

    // 查询该 PID 对应的IP地址和端口
    const { stdout } = await execPromise(`${portCommand}${pid}`);
    const stdoutInput = stdout.trim().match(/\d+$/)?.input;

    if (stdoutInput) {
      const ipReg = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}\b/;
      const ipEndpoint = stdoutInput.match(ipReg);
      const ollamaServeEndpoint = `http://${ipEndpoint}`;
      return ollamaServeEndpoint;
    } else {
      return null;
    }
  } catch (error) {
    log.error(`Retrieving ollama serve: ${error}`);
    return null;
  }
};

const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    await execPromise("ollama --version")
    // const { stdout } = await execPromise("ollama --version");
    // log.info(`\n${stdout.trim()}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log.error(`Ollama is not available: ${error.message}`);
    } else {
      log.error("Unknown error checking ollama availability");
    }
    return false;
  }
};

const isOllamaServeRunning = async (): Promise<boolean> => {
  try {
    if (currentPlatform() === "win32") {
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
    initSpinner.succeed("Ollama is available.");
    const running = await isOllamaServeRunning();
    if (!running) {
      initSpinner.start("Starting ollama serve...");
      const ollamaProcessHelper = spawn("node", ["dist/startOllamaServe.js"], {
        detached: true,
        stdio: "ignore",
      });
      autoSetOllamaEndpoint();
      initSpinner.succeed("Success init ollama");
      ollamaProcessHelper.unref();
    } else {
      autoSetOllamaEndpoint();
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
        log.warning("Please download the installer and run it.");
        log.warning("After installation, set the configuration manually.");
      }
    } else {
      log.error("\nBye!");
      process.exit();
    }
  }
};

const autoSetOllamaEndpoint = async () => {
  const OLLAMA_SERVE_ENDPOINT = await getOllamaServeEndpoint();
  initConfig();
  if (OLLAMA_SERVE_ENDPOINT) {
    setConfig("END_POINT", OLLAMA_SERVE_ENDPOINT, true);
  }
};
