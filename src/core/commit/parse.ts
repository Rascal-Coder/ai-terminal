import { createChatRequest } from './prompt';

import { ollamaServer } from '@/utils/ollamaServer';

/**
 * @description 提交信息生成请求
 * @param diff {string}
 * @param options {{locale: string, maxLength: number}}
 */
export const createChatCompletion = async (
  diff: string,
  options: { locale: string; maxLength: number },
) => {
  const json = await createChatRequest(diff, options);
  const ollama = await ollamaServer();
  const res = await ollama.chat(json);
  const parseResult = res.message;
  return parseResult;
};
