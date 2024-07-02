import { createChatRequest } from './prompt';

import { ollamaServer } from '@/utils/ollamaServer';

/**
 *
 * @param diff {string}
 * @param options {{locale: string, maxLength: number}}
 */
export const createChatCompletion = async (
  diff: string,
  options: { locale: string; maxLength: number },
) => {
  const { locale, maxLength } = options;
  const json = await createChatRequest(diff, { locale, maxLength });
  const ollama = await ollamaServer();
  const res = await ollama.chat(json);
  const parseResult = res.message;
  return parseResult;
};
