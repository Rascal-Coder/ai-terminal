#!/usr/bin/env node
import { spawn } from "child_process";
import { colorize } from "@/utils";

const startOllamaServe = (): void => {
  const ollamaProcess = spawn("ollama", ["serve"], {
    detached: true,
    stdio: ["ignore", "pipe", "ignore"],
  });

  ollamaProcess.stdout.on("data", (data) => {
    const output = data.toString();
    const match = output.match(/Listening on port (\d+)/);
    if (match) {
      console.log(colorize(`Ollama is listening on port ${match[1]}.`, "green"));
    }
  });

  ollamaProcess.unref();
};

startOllamaServe();
