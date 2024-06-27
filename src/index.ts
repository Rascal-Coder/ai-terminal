#!/usr/bin/env node
import { exec as execCb, spawn } from "child_process";
import { promisify } from "util";
import os from "node:os";
import { colorize } from "@/utils";
import { confirm } from "@clack/prompts";
const exec = promisify(execCb);

const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const { stdout } = await exec("ollama --version");
    console.log(colorize(`${stdout.trim()}`, "cyan"));
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

const startOllamaServe = async (): Promise<void> => {
  const ollamaProcess = spawn("ollama", ["serve"]);

  ollamaProcess.stderr.on("data", (data) => {
    const output = data.toString();
    if (output.includes("Listening on")) {
      console.log(
        colorize(
          "Ollama has been successfully started and is listening.",
          "green"
        )
      );
    }
  });

  ollamaProcess.on("close", (code) => {
    console.log(
      colorize(`ollama serve process exited with code ${code}`, "red")
    );
  });
};
const platform: NodeJS.Platform = os.platform();

// Example usage:
const main = async () => {
  console.log(colorize("Welcome to ai-terminali!", "green"));
  const available = await isOllamaAvailable();
  if (available) {
    console.log(colorize("Ollama is available.", "green"));
    console.log(colorize("Starting ollama serve...", "green"));
    await startOllamaServe();
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

function getOllamaDownloadUrl(): string | null {
  let url: string;
  if (platform === "win32") {
    return (url = "https://ollama.com/download/OllamaSetup.exe");
  } else if (platform === "darwin") {
    return (url = "https://ollama.com/download/Ollama-darwin.zip");
  } else {
    console.error(colorize("Unsupported platform:", "red"), platform);
    return null;
  }
}

main();
