import { ModelResponse } from 'ollama';

import { consoleTable1, consoleTable2, getOllamaAllModels } from './utils';

import { ollamaServer } from '@/utils/ollamaServer';

export const getModel = async (argv: string) => {
  if (argv === 'available') {
    getOllamaAllModels()
      .then((models) => {
        consoleTable1(models);
      })
      .catch((err) => {
        console.error('Error fetching or reading the cache:', err);
      });
  } else {
    const ollama = await ollamaServer();
    const res = await ollama.list();
    const groupedData = res.models.reduce<{ [key: string]: ModelResponse[] }>((acc, model) => {
      const prefix = model.name.split(':')[0];
      if (!acc[prefix]) {
        acc[prefix] = [];
      }
      acc[prefix].push(model);
      return acc;
    }, {});
    consoleTable2(groupedData);
  }
};
