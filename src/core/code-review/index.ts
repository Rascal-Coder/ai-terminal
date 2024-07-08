import { promises as fs } from 'node:fs';
import { intro, outro, spinner } from '@clack/prompts';
import path from 'node:path';
import chalk from 'chalk';

import { getConfig } from '../config';

import { codeReviewPrompt } from './prompt';

import { getFilesChangedInGitAdd, allStagedFiles2Message, validatePath } from '@/utils';
import { ollamaServer } from '@/utils/ollamaServer';
import { CHAT_OPTIONS } from '@/utils/constants';
const aiCodeReview = async (file?: string) => {
  intro(`${chalk.blue('开始读取缓存区文件更改')}`);
  if (file) {
    await validatePath(file);
    console.log('Valid path.');
  }
  // 获取缓存区的文件列表
  const files = getFilesChangedInGitAdd(file);
  // 读取文件内容，并存储在staged数组中
  const staged = await Promise.all(
    files.filter(Boolean).map(async (file) => {
      const content = await fs.readFile(file, 'utf-8');
      return { filename: file, content };
    }),
  );

  // 判断是否有文件被缓存
  if (!staged || staged.length === 0) {
    throw new Error('没有文件被缓存');
  }

  const promptsSpinner = spinner();
  promptsSpinner.start('AI 正在分析您的更改');

  try {
    // 将缓存的文件内容转换为消息
    const content = allStagedFiles2Message(staged);
    const model = (await getConfig('OLLAMA_MODEL')) as string;
    const data = {
      model: model,
      messages: [
        {
          role: 'system',
          content: content,
        },
        {
          role: 'user',
          content: codeReviewPrompt,
        },
      ],
      options: CHAT_OPTIONS,
    };
    const ollama = await ollamaServer();
    const res = await ollama.chat(data);
    const completion = res.message.content;
    const filePath = path.join(process.cwd(), `cr.md`);
    await fs.writeFile(filePath, completion, 'utf8');

    promptsSpinner.stop();
    outro('result');
  } catch (err) {
    promptsSpinner.stop();
    console.error('错误:', err);
    process.exit(1);
  }
};
export default aiCodeReview;
