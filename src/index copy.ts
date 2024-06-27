#!/usr/bin/env node

import fetch, { Response } from "node-fetch";
import fs from "node:fs";
import os from "node:os";
import path, { dirname } from "path";
import { fileURLToPath } from "node:url";
import { confirm } from "@clack/prompts";
import { colorize, calculateSpeed, formatSize } from "@/utils";
import cliProgress from "cli-progress";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function downloadFile(
  url: string,
  outputLocationPath: string,
  retries = 3
): Promise<void> {
  let startTime = Date.now();
  const progressBar = new cliProgress.SingleBar({
    format: `{bar} {percentage}% | ETA: {eta}s | {value}/{total} {speed} | {size}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response: Response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to download file (HTTP status ${response.status})`
        );
      }

      const contentLengthHeader = response.headers.get("content-length");
      if (!contentLengthHeader) {
        throw new Error("Content-Length header is missing or invalid");
      }
      const totalLength: number = Number(contentLengthHeader);
      if (isNaN(totalLength) || totalLength <= 0) {
        throw new Error("Invalid content-length header");
      }
      progressBar.start(totalLength, 0, {
        speed: "0 KB/s",
        size: "0 bytes",
      });

      const writer = fs.createWriteStream(outputLocationPath);
      let downloadedLength = 0;

      const responseBody = response.body;
      if (!responseBody) {
        throw new Error("Response body is null");
      }

      responseBody.on("data", (chunk: Buffer) => {
        downloadedLength += chunk.length;
        progressBar.update(downloadedLength, {
          speed: calculateSpeed(downloadedLength, startTime),
          size: formatSize(totalLength),
        });
      });

      await new Promise<void>((resolve, reject) => {
        writer.on("finish", () => {
          progressBar.stop();
          resolve();
        });
        writer.on("error", (err) => {
          progressBar.stop();
          reject(err);
        });
        responseBody.pipe(writer);
      });

      console.log(colorize("\nDownload completed!", "green"));
      return;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(
          colorize(
            `\nDownload failed (attempt ${attempt}): ${error.message}`,
            "red"
          )
        );
      } else {
        console.error(
          colorize(
            `\nDownload failed with unknown error (attempt ${attempt})`,
            "red"
          )
        );
        console.error(error);
      }

      if (attempt >= retries) {
        console.error(
          colorize("Exceeded retry limit. Download failed.", "red")
        );
        throw error;
      } else {
        const shouldRetry = await confirm({
          message: "Do you want to retry?",
          initialValue: true,
        });

        if (!shouldRetry) {
          // const downloadLink = colorize(url, "cyan");
          // console.log(
          //   colorize(`You can download the file manually from: ${downloadLink}`, "yellow")
          // );

          const shouldDownloadManually = await confirm({
            message: "Do you want to download the file manually?",
            initialValue: true,
          });

          if (shouldDownloadManually) {
            openBrowser(url);
            // console.log(colorize(`Opening browser for download: ${downloadLink}`, "cyan"));
            // // Implement code to open browser automatically (optional)
          } else {
            console.log(colorize("Download cancelled by user.", "red"));
            process.exit(1);
          }
        } else {
          console.log(colorize("Retrying...", "yellow"));
        }
      }
    }
  }
}

// Determine platform and choose download URL and output location
const platform: NodeJS.Platform = os.platform();
let url: string;
let outputLocationPath: string;

if (platform === "win32") {
  url = "https://ollama.com/download/OllamaSetup.exe";
  outputLocationPath = path.resolve(__dirname, "OllamaSetup.exe");
} else if (platform === "darwin") {
  url = "https://ollama.com/download/Ollama-darwin.zip";
  outputLocationPath = path.resolve(__dirname, "Ollama-darwin.zip");
} else {
  console.error(colorize("Unsupported platform:", "red"), platform);
  process.exit(1);
}

downloadFile(url, outputLocationPath)
  .then(() => console.log(colorize("Download process completed!", "green")))
  .catch(async (err: unknown) => {
    if (err instanceof Error) {
      console.error(colorize("Download process failed:", "red"), err.message);
    } else {
      console.error(
        colorize("Download process failed with unknown error", "red")
      );
      console.error(err);
    }
  });
// Function to open browser with specified URL
function openBrowser(url: string): void {
  if (os.platform() === "win32") {
    spawn("cmd", ["/c", "start", url], { detached: true });
  } else if (os.platform() === "darwin") {
    spawn("open", [url], { detached: true });
  } else {
    console.error("Opening browser not supported on this platform.");
  }
}