import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { outro, spinner } from '@clack/prompts';

import { getConfig } from '../config';

import { getUserInput } from './select';
import { generatorComponentPrompt } from './prompt';

import { validateFileName, validatePath } from '@/utils';
import { UserSelection } from '@/types';
import { ollamaServer } from '@/utils/ollamaServer';

interface CodeBlocks {
  [key: string]: string[];
}

export default async function createComponents({
  componentName,
  componentPath,
}: {
  componentName: string;
  componentPath: string | undefined;
}) {
  try {
    await validateFileName(componentName);

    if (componentPath) {
      await validatePath(componentPath);
      console.log('Valid path.');
    }

    const input = (await getUserInput()) as UserSelection;

    const prompts = generatorComponentPrompt(input);

    const s = spinner();
    s.start('AI is generating components for you');

    const model = (await getConfig('OLLAMA_MODEL')) as string;
    const data = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates component code.',
        },
        {
          role: 'user',
          content: prompts,
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

    const tokens = marked.lexer(completion);
    const result: CodeBlocks = {};

    tokens.forEach((token) => {
      if (token.type === 'code') {
        const lang = token.lang || 'plaintext';
        if (!result[lang]) {
          result[lang] = [];
        }
        result[lang].push(token.text);
      }
    });

    const finalComponentPath = componentPath ? `./src/${componentPath}` : './src/components';
    const outputDir = path.join(process.cwd(), finalComponentPath, componentName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const [key, value] of Object.entries(result)) {
      if (['css', 'less', 'scss'].includes(key)) {
        const filePath = path.join(outputDir, `index.module.${input.cssOption || 'css'}`);
        fs.writeFileSync(filePath, value.join('\n\n'), 'utf8');
      } else {
        const filePath = path.join(outputDir, `index.tsx`);
        fs.writeFileSync(filePath, value.join('\n\n'), 'utf8');
      }
    }

    s.stop();
    outro('Component creation complete 🎉🎉🎉');
  } catch (error) {
    console.error('Error creating component:', error);
  }
}
