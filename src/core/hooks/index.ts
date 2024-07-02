import { outro, spinner } from '@clack/prompts';
import { marked } from 'marked';
import path from 'path';
import fs from 'fs/promises';

import { getConfig } from '../config';

import { getUserInput } from './select';
import { generatorComponentPrompt } from './prompt';

import { validateFileName } from '@/utils';
import { CustomHooksSelection } from '@/types';
import { ollamaServer } from '@/utils/ollamaServer';

interface CodeBlocks {
  [key: string]: string[];
}
const getAIResponse = async (prompts: string) => {
  const model = (await getConfig('OLLAMA_MODEL')) as string;
  const data = {
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates custom hooks.',
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
  return res.message.content;
};

const parseCompletionToCodeBlocks = (completion: string): CodeBlocks => {
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

  return result;
};

const writeCodeBlocksToFile = async (
  result: CodeBlocks,
  outputDir: string,
  fileName: string,
  prefix: string,
) => {
  await fs.mkdir(outputDir, { recursive: true });

  for (const [_, value] of Object.entries(result)) {
    const filePath = path.join(outputDir, `${fileName}.${prefix}`);
    await fs.writeFile(filePath, value.join('\n\n'), 'utf8');
  }
};

const generatorHooks = async (fileName: string) => {
  try {
    await validateFileName(fileName);

    const input = (await getUserInput()) as CustomHooksSelection;
    const prompts = generatorComponentPrompt(input);

    const promptsSpinner = spinner();
    promptsSpinner.start('AI is generating hooks for you');

    const completion = await getAIResponse(prompts);
    const result = parseCompletionToCodeBlocks(completion);

    const finalComponentPath = './src/hooks';
    const outputDir = path.join(process.cwd(), finalComponentPath);
    const prefix =
      input.framework === 'Vue'
        ? 'Vue'
        : input.framework === 'React' && input.languageType === 'TypeScript'
          ? 'tsx'
          : 'jsx';

    await writeCodeBlocksToFile(result, outputDir, fileName, prefix);

    promptsSpinner.stop();
    outro('Hooks creation complete 🎉🎉🎉');
  } catch (error) {
    console.error(error);
  }
};
export default generatorHooks;
