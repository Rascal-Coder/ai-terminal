import path from "path";
import { promises as fs } from "node:fs";
import os from "node:os";
import { CONFIG_FILE_NAME } from "@/utils/constants";
import { ConfigItem } from "@/types";
import { log, oraSpinner } from "@/utils";
function getConfigFilePath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}

async function ensureConfigFileExists(once: boolean = false): Promise<void> {
  const configFilePath = getConfigFilePath();
  const initSpinner = oraSpinner();
  try {
    await fs.access(configFilePath);
    !once && initSpinner.succeed("Config file is exist");
  } catch {
    !once &&
      initSpinner.info(
        "Config file does not exist. Creating a default config file."
      );
    const defaultConfig: ConfigItem = {
      OLLAMA_HOST: 'http://127.0.0.1:11434',
      OLLAMA_MODEL: "",
    };
    try {
      await fs.writeFile(
        configFilePath,
        JSON.stringify(defaultConfig, null, 2)
      );
      !once &&
        initSpinner.succeed(
          `Default config file created at: ${configFilePath}`
        );
    } catch (writeError) {
      initSpinner.fail(`Error creating config file: ${writeError}`);
    }
  }
}

async function readConfigFile(configFilePath: string): Promise<ConfigItem> {
  const fileContent = await fs.readFile(configFilePath, "utf8");
  return JSON.parse(fileContent) as ConfigItem;
}

export async function setConfig(
  key: keyof ConfigItem,
  value: string,
  once: boolean = false
): Promise<void> {
  await ensureConfigFileExists(once);
  const configFilePath = getConfigFilePath();
  try {
    const config = await readConfigFile(configFilePath);
    if (!Object.keys(config).includes(key)) {
      log.bgerror(`Config key does not exist: ${key}`);
    } else {
      config[key] = value;
      await fs.writeFile(configFilePath, JSON.stringify(config, null, 2));
      log.bgsuccess(`Config set: ${key} = ${value}`);
    }
  } catch (error) {
    log.error(`Error reading config file: ${error}`);
  }
}
export async function getConfig(key: keyof ConfigItem): Promise<string | null> {
  await ensureConfigFileExists();

  const configFilePath = getConfigFilePath();
  try {
    const config = await readConfigFile(configFilePath);
    if (Object.keys(config).includes(key)) {
      log.bgsuccess(`Config get: ${key} = ${config[key]}`);
      return config[key];
    } else {
      log.bgerror(`Config key not found: ${key}`);
      return null
    }
  } catch (error) {
    log.error(`Error reading config file: ${error}`);
    return null
  }
}

// 在脚手架项目初始化时调用此函数
export async function initConfig(): Promise<void> {
  await ensureConfigFileExists();
}
