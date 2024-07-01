import { Ollama } from 'ollama';

import { getConfig } from '@/core/config';
const createOllama = async () => {
  const host = (await getConfig('OLLAMA_HOST')) as string;
  const ollama = new Ollama({
    host,
  });
  return ollama;
};

export const ollamaServer = async () => {
  const ollama = await createOllama();
  return ollama;
};
