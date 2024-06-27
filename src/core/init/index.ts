import path from "path";
import { promises as fs } from "node:fs";
import os from "node:os";

import { CONFIG_FILE_NAME } from "@/utils/constants";
import { ConfigItem } from "@/types";
import { colorize } from "@/utils";
function getConfigFilePath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}

async function ensureConfigFileExists(): Promise<void> {
  const configFilePath = getConfigFilePath();
  try {
    await fs.access(configFilePath);
  } catch {
    console.log("Config file does not exist. Creating a default config file.");

    const defaultConfig: ConfigItem = {
      END_POINT: "",
      USE_OLLAMA_MODEL: "",
    };

    try {
      await fs.writeFile(
        configFilePath,
        JSON.stringify(defaultConfig, null, 2)
      );
      console.log(`Default config file created at: ${configFilePath}`);
    } catch (writeError) {
      console.error("Error creating config file:", writeError);
    }
  }
}

export async function setConfig(
  key: keyof ConfigItem,
  value: string
): Promise<void> {
  await ensureConfigFileExists();

  const configFilePath = getConfigFilePath();
  try {
    const fileContent = await fs.readFile(configFilePath, "utf8");
    const config = JSON.parse(fileContent) as ConfigItem;
    config[key] = value;
    await fs.writeFile(configFilePath, JSON.stringify(config, null, 2));
    console.log(colorize(`Config set: ${key} = ${value}`, "green"));
  } catch (error) {
    console.error("Error setting config:", error);
  }
}
export async function getConfig(key: keyof ConfigItem): Promise<void> {
  await ensureConfigFileExists();

  const configFilePath = getConfigFilePath();
  try {
    const fileContent = await fs.readFile(configFilePath, "utf8");
    const config = JSON.parse(fileContent) as ConfigItem;
    console.log(colorize(`${key} = ${config[key]}`, "cyan"));
  } catch (error) {
    console.error("Error reading config file:", error);
  }
}

// 在脚手架项目初始化时调用此函数
export async function initializeProject(): Promise<void> {
  await ensureConfigFileExists();
}
