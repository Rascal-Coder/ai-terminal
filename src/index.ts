#!/usr/bin/env node
import { exec as execCb, spawn } from "child_process";
import { promisify } from "util";
import os from "node:os";
import { colorize, getOllamaDownloadUrl, getOllamaPort } from "@/utils";
import { confirm } from "@clack/prompts";
const exec = promisify(execCb);
const platform: NodeJS.Platform = os.platform();
const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const { stdout } = await exec("ollama --version");
    console.log(`${stdout.trim()}`);
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
      const { stdout } = await exec("tasklist");
      return stdout.toLowerCase().includes("ollama.exe");
    } else {
      const { stdout } = await exec("pgrep -f 'ollama serve'");
      return stdout.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
};

// Example usage:
const main = async () => {
  console.log(colorize("Welcome to ai-terminali!", "green"));
  const available = await isOllamaAvailable();
  if (available) {
    console.log(colorize("Ollama is available.", "green"));
    const running = await isOllamaServeRunning();
    if (!running) {
      console.log(colorize("Starting ollama serve...", "green"));
      spawn("node", ["dist/startOllamaServe.js"], {
        detached: true,
        stdio: "ignore",
      }).unref();

    } else {
      console.log(colorize("Ollama is already running.", "green"));
    }
  } else {
    console.log(colorize("Ollama is not available.", "red"));
    console.log(colorize("ai-terminal need ollama serve", "yellow"));

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
      console.log(colorize("Bye!", "red"));
      process.exit();
    }
  }
};

// Function to open browser with specified URL
function openBrowser(url: string): void {
  if (platform === "win32") {
    spawn("cmd", ["/c", "start", url], { detached: true });
  } else if (platform === "darwin") {
    spawn("open", [url], { detached: true });
  }
}

main();
