import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { confirm } from '@clack/prompts';
import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';

import { setConfig } from '@/core/config';
import { openBrowser, currentPlatform, oraSpinner, log } from '@/utils';
import { DOWNLOAD_URLS } from '@/utils/constants';
const execPromise = promisify(exec);

const allowedPlatforms = Object.keys(DOWNLOAD_URLS);

const getOllamaDownloadUrl = (): string | null => {
  if (allowedPlatforms.includes(currentPlatform())) {
    return DOWNLOAD_URLS[currentPlatform()];
  } else {
    log.error(`Unsupported platform: ${currentPlatform()}`);
    return null;
  }
};

export const getOllamaServeHost = async (): Promise<string | null> => {
  try {
    let pidCommand = '';
    let portCommand = '';

    // 根据操作系统选择适当的命令
    if (currentPlatform() === 'win32') {
      pidCommand = 'tasklist /fi "imagename eq ollama.exe" /fo csv /nh';
      portCommand = 'netstat -ano | findstr LISTENING | findstr ';
    } else if (currentPlatform() === 'darwin') {
      pidCommand = 'pgrep -f "ollama serve"';
      portCommand = 'lsof -i -P -n | grep LISTEN | grep ';
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
      const hostReg = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}\b/;
      const ipHost = stdoutInput.match(hostReg);
      const ollamaServeEndpoint = `http://${ipHost}`;
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
    await execPromise('ollama --version');
    // const { stdout } = await execPromise("ollama --version");
    // log.info(`\n${stdout.trim()}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log.error(`Ollama is not available: ${error.message}`);
    } else {
      log.error('Unknown error checking ollama availability');
    }
    return false;
  }
};

const isOllamaServeRunning = async (): Promise<boolean> => {
  try {
    if (currentPlatform() === 'win32') {
      const { stdout } = await execPromise('tasklist');
      return stdout.toLowerCase().includes('ollama.exe');
    } else {
      const { stdout } = await execPromise("pgrep -f 'ollama serve'");
      return stdout.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
};

export const autoSetOllamaHost = async () => {
  const OLLAMA_SERVE_ENDPOINT = await getOllamaServeHost();
  if (OLLAMA_SERVE_ENDPOINT) {
    await setConfig('OLLAMA_HOST', OLLAMA_SERVE_ENDPOINT);
  }
};
/**
 * 初始化 Ollama 服务。
 * 检查 Ollama 是否可用，如果不可用，询问用户是否下载 Ollama。
 * 如果 Ollama 可用但未运行，则启动 Ollama 服务。
 */
export const initOllama = async () => {
  // 初始化一个 spinner 来显示进度
  const initSpinner = oraSpinner();
  // initSpinner.start('Check Ollama available...');

  // 检查 Ollama 是否可用
  const available = await isOllamaAvailable();
  if (available) {
    initSpinner.succeed('Ollama is available.');
    // 检查 Ollama 服务是否正在运行
    const running = await isOllamaServeRunning();
    if (!running) {
      // 如果 Ollama 服务没有运行，则启动服务
      // const ollamaProcessHelper = spawn('node', ['dist/startOllamaServe.js'], {
      //   detached: true,
      //   stdio: 'ignore',
      // });
      startOllamaServe();
      initSpinner.succeed('Success init ollama');
      // 释放进程引用，允许 Node.js 主进程退出
      // ollamaProcessHelper.unref();
    } else {
      initSpinner.succeed('Ollama is already running.');
    }
  } else {
    // 如果 Ollama 不可用，则向用户询问是否下载 Ollama
    initSpinner.fail('Ollama is not available.');
    const isDownloadOllama = await confirm({
      message: 'Do you want to download ollama?',
      initialValue: true,
    });
    if (isDownloadOllama) {
      // 如果用户同意下载，则提供下载链接并打开浏览器
      const url = getOllamaDownloadUrl();
      if (url) {
        openBrowser(url);
        // 提示用户完成安装后需要手动设置配置
        log.warning('Please download the installer and run it.');
        log.warning('After installation, set the configuration manually.');
        log.infoWithUnderline('Use the command: ras set OLLAMA_HOST', '<your_ollamaServiceHost>');
      }
    } else {
      // 如果用户不同意下载，则结束进程
      log.error('\nBye!');
      process.exit();
    }
  }
};
const startOllamaServe = () => {
  try {
    const ollamaPath = getExecutablePath('ollama');
    const directory = path.dirname(ollamaPath);
    const appPath = path.join(directory, 'ollama app.exe');

    if (!fs.existsSync(appPath)) {
      console.error(`Executable not found: ${appPath}`);
      return;
    }

    const ollamaProcess = spawn(appPath, [], {
      detached: true,
      stdio: 'ignore',
    });

    console.log(`Starting Ollama: ${appPath}`);

    ollamaProcess.unref();
  } catch (error) {
    console.error(`Error starting Ollama: ${error}`);
  }
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
