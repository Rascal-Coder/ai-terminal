import fs from 'node:fs';
import { intro, outro, spinner } from '@clack/prompts';
import path from 'node:path';

import { getConfig } from '../config';

import { codeReviewPrompt } from './prompt';

import { getFilesChangedInGitAdd, allStagedFiles2Message } from '@/utils';
import { ollamaServer } from '@/utils/ollamaServer';

export default async function commitMessage() {
  intro('-- 开始读取缓存区文件更改');

  // 获取缓存区的文件列表
  const files = getFilesChangedInGitAdd();

  // 读取文件内容，并存储在staged数组中
  const staged = files.filter(Boolean).map((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    return { filename: file, content };
  });

  // 判断是否有文件被缓存
  if (!staged || staged.length === 0) {
    throw new Error('没有文件被缓存');
  }

  const s = spinner();
  s.start('AI 正在分析您的更改');

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
      options: {
        top_p: 0.9, // 提高文本的多样性
        temperature: 0.6, // 降低温度以增加结果的确定性
        num_predict: 256, // 增加预测的最大token数量，以确保生成完整代码
        repeat_penalty: 1.2, // 提高重复惩罚以减少重复内容
        top_k: 50, // 适度降低top_k值以减少无关内容
      },
    };
    const ollama = await ollamaServer();
    const res = await ollama.chat(data);
    const completion = res.message.content;
    const filePath = path.join(process.cwd(), `moment.md`);

    fs.writeFileSync(filePath, completion, 'utf8');

    s.stop();
    outro('result');
  } catch (err) {
    s.stop();
    console.error('错误:', err);
    process.exit(1);
  }
}
