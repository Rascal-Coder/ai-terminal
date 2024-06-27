#!/usr/bin/env node
import { spawn } from "child_process";
import { getOllamaPort } from "@/utils";
const startOllamaServe =async (): Promise<void> => {
  const ollamaProcess = spawn("ollama", ["serve"], {
    detached: true,
    stdio: "ignore",
  });
  await getOllamaPort();
  ollamaProcess.unref();
};

startOllamaServe();
