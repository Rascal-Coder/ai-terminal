import { GroupedData } from './types';
import { consoleTable1, consoleTable2, getOllamaAllModels } from './utils';

import { ollamaModelApi } from '@/utils/service/api';

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
    const res = await ollamaModelApi();
    const groupedData = res.models.reduce<GroupedData>((acc, model) => {
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
