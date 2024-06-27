#!/usr/bin/env node
import { spawn } from "child_process";
// 开启ollama服务的辅助进程
const startOllamaServe =async (): Promise<void> => {
  const ollamaProcess = spawn("ollama", ["serve"], {
    detached: true,
    stdio: "ignore",
  });
  ollamaProcess.unref();
};

startOllamaServe();
