#!/usr/bin/env node
import { execSync, spawn } from "child_process";
import path from "node:path";
import { currentPlatform } from "./utils";
// 开启ollama服务的辅助进程
const startOllamaServe = async (): Promise<void> => {
  const ollamaPath = getExecutablePath("ollama");
  const directory = path.dirname(ollamaPath);
  // 拼接 ollama app.exe 的路径
  const appPath = path.join(directory, 'ollama app.exe');
  // 启动 ollama app.exe
  const ollamaProcess = spawn(appPath, [], {
    detached: true,
    stdio: "ignore",
  });
  ollamaProcess.unref();
};
/**
 * 获取可执行文件的路径。
 * @param executable 要查找的可执行文件的名称。
 * @returns 可执行文件的路径字符串。
 */
const getExecutablePath = (executable: string) => {
    let command;
    if (currentPlatform() === 'win32') {
      command = `where ${executable}`;
    } else if (currentPlatform() === 'darwin') {
      command = `which ${executable}`;
    } else {
      throw new Error(`Unsupported platform: ${currentPlatform()}`);
    }
    const result = execSync(command).toString().trim();
    return result;
};

startOllamaServe();
