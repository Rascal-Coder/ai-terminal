// import fs from 'node:fs';
import { promises as fs } from 'fs';
import { cancel, intro, spinner } from '@clack/prompts';
import chalk from 'chalk';

import selectCommitMsg from './gitCommit';
import { createChatCompletion } from './parse';

import { getFilesChangedInGitAdd, allStagedFiles2Message, log } from '@/utils';

const commitMessage = async () => {
  intro(`${chalk.blue('开始读取缓存区文件更改')}`);
  // 获取缓存区的文件列表
  const files = getFilesChangedInGitAdd();

  // 读取文件内容，并存储在staged数组中
  const staged = await Promise.all(
    files.filter(Boolean).map(async (file) => {
      const content = await fs.readFile(file, 'utf-8');
      return { filename: file, content };
    }),
  );

  // 判断是否有文件被缓存
  if (!staged || staged.length === 0) {
    cancel('请检查是否执行git add .');
    process.exit(0);
  }
  const promptsSpinner = spinner();
  promptsSpinner.start('AI 正在分析您的更改');

  try {
    // 将缓存的文件内容转换为消息
    const content = allStagedFiles2Message(staged);
    const message = await createChatCompletion(content, { locale: 'zh-CN', maxLength: 200 });
    const completion = message.content;

    // 去除不需要的字符
    const aiCommitMsg = completion.replace(/[*_`~]/g, '');
    promptsSpinner.stop();
    await selectCommitMsg(aiCommitMsg);
  } catch (err) {
    promptsSpinner.stop();
    console.error('错误:', err);
    process.exit(1);
  }
};
export default commitMessage;
