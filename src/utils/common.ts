import { execSync, spawn } from 'child_process';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'fs';

import { Staged } from '@/types';
/**
 * @description 判断当前运行的操作系统类型。
 * @returns NodeJS.Platform - 操作系统的类型，如 'win32', 'darwin', 'linux' 等。
 */
export const currentPlatform = (): NodeJS.Platform => os.platform();
/**
 * @description 根据操作系统的不同，打开指定的URL。
 * @param url 要打开的URL字符串。
 */
export const openBrowser = (url: string): void => {
  if (currentPlatform() === 'win32') {
    spawn('cmd', ['/c', 'start', url], { detached: true });
  } else if (currentPlatform() === 'darwin') {
    spawn('open', [url], { detached: true });
  }
};

export const validateFileName = async (componentName: string): Promise<void> => {
  // 验证文件名是否合法
  if (!/^[a-zA-Z0-9-_]+$/.test(componentName)) {
    throw new Error(
      'Invalid component name. Only alphanumeric characters, dashes, and underscores are allowed.',
    );
  }
};

export function getFilesChangedInGitAdd() {
  const gitDiff = execSync('git diff --cached --name-status', { encoding: 'utf-8' });
  const files = gitDiff.split('\n');

  // 过滤掉 lock 文件和被删除的文件
  const ignoredPatterns = [/package-lock\.json$/, /yarn\.lock$/, /pnpm-lock\.yaml$/];
  const filteredFiles = files
    .map((line) => {
      const [status, file] = line.trim().split('\t');
      return { status, file };
    })
    .filter(({ status, file }) => {
      return file && status !== 'D' && !ignoredPatterns.some((pattern) => pattern.test(file));
    })
    .map(({ file }) => file);

  return filteredFiles;
}

export function allStagedFiles2Message(staged: Staged[]) {
  return staged.map((item) => item.content).join('\n');
}

/**
 * 自动执行提交信息
 */
export async function autoCommit(commitMsg: string) {
  try {
    const result = execSync(`git commit -m "${commitMsg}"`);
    return 0;
  } catch (e) {
    return -1;
  }
}

export function remindCommiting() {
  console.log('正在提交中...');
}
export async function validatePath(componentPath: string): Promise<void> {
  // 验证路径是否合法
  const dir = path.resolve(componentPath);

  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      throw new Error('Invalid path. The specified directory does not exist.');
    }
  } catch (error) {
    throw new Error('Invalid path. The specified directory does not exist.');
  }
}
