import { promises as fs } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { outro, spinner } from '@clack/prompts';

import { getConfig } from '../config';

import { getUserInput } from './select';
import { generatorComponentPrompt } from './prompt';

import { validateFileName, validatePath } from '@/utils';
import { UserSelection } from '@/types';
import { ollamaServer } from '@/utils/ollamaServer';
import { CHAT_OPTIONS } from '@/utils/constants';

interface CodeBlocks {
  [key: string]: string[];
}
async function createComponentDirectory(outputDir: string) {
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating directory: ${error.message}`);
    } else {
      throw new Error(`Error creating directory`);
    }
  }
}

async function writeComponentFiles(outputDir: string, result: CodeBlocks, cssOption: string) {
  try {
    for (const [key, value] of Object.entries(result)) {
      const ext = ['css', 'less', 'scss'].includes(key)
        ? `index.module.${cssOption || 'css'}`
        : 'index.tsx';
      const filePath = path.join(outputDir, ext);
      await fs.writeFile(filePath, value.join('\n\n'), 'utf8');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating directory: ${error.message}`);
    } else {
      throw new Error(`Error creating directory`);
    }
  }
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

    const promptsSpinner = spinner();
    promptsSpinner.start('AI is generating components for you');

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
      options: CHAT_OPTIONS,
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
    await createComponentDirectory(outputDir);
    await writeComponentFiles(outputDir, result, input.cssOption);
    promptsSpinner.stop();
    outro('Component creation complete 🎉🎉🎉');
  } catch (error) {
    console.error('Error creating component:', error);
  }
}
