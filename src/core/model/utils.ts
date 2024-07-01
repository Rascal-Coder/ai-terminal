import https from 'https';
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { GroupedData, Models } from './types';

import { OLLAMA_MODEL } from '@/utils/constants';
const OLLAMA_MODEL_FILE = path.join(os.homedir(), OLLAMA_MODEL);
export const consoleTable1 = (
  models: Models,
  nameWidth = 40,
  typeWidth = 20,
  nameColor = '\x1b[36m',
  typeColor = '\x1b[33m',
) => {
  const BORDER_TOP = `╔${'═'.repeat(nameWidth + typeWidth + 1)}╗`;
  const BORDER_MID = `╠${'═'.repeat(nameWidth + typeWidth + 1)}╣`;
  const BORDER_MID_ITEM = `╠${'─'.repeat(nameWidth + typeWidth + 1)}╣`;
  const BORDER_BOT = `╚${'═'.repeat(nameWidth + typeWidth + 1)}╝`;
  const RESET = '\x1b[0m';

  console.log(BORDER_TOP);
  console.log(
    `${nameColor}${'NAME'.padEnd(
      nameWidth,
    )}${RESET} ${typeColor}${'TYPE'.padEnd(typeWidth)}${RESET}`,
  );
  console.log(BORDER_MID);

  models.forEach((model, index) => {
    const { name, type } = model;
    console.log(`${name.padEnd(nameWidth)} ${type.padEnd(typeWidth)}`);
    if (index < models.length - 1) {
      console.log(BORDER_MID_ITEM);
    }
  });

  console.log(BORDER_BOT);
};

export const consoleTable2 = (groupedData: GroupedData) => {
  const BORDER_TOP = '╔════════════════════════════════════════════════════╗';
  const BORDER_MID = '╠════════════════════════════════════════════════════╣';
  const BORDER_BOT = '╚════════════════════════════════════════════════════╝';

  // 高亮效果
  const GROUP_HIGHLIGHT = '\x1b[32m'; // 绿色
  const RESET = '\x1b[0m'; // 重置颜色

  console.log(BORDER_TOP);

  for (const [prefix, models] of Object.entries(groupedData)) {
    console.log(`${GROUP_HIGHLIGHT}GROUP: ${prefix}${RESET}`);
    console.log(`${'NAME'.padEnd(30)} ${'SIZE'.padEnd(10)}`);
    console.log(BORDER_MID);

    models.forEach((model) => {
      const name = model.name;
      const sizeMB = model.size / (1024 * 1024);
      const sizeStr =
        sizeMB < 1024 ? `${sizeMB.toFixed(1)} MB` : `${(sizeMB / 1024).toFixed(1)} GB`;
      console.log(`${name.padEnd(30)} ${sizeStr.padEnd(10)}`);
    });
    console.log(BORDER_BOT);
  }
};
export const getOllamaAllModels = async (): Promise<Models> => {
  return new Promise((resolve, reject) => {
    fs.readFile(OLLAMA_MODEL_FILE, (err, data) => {
      if (err || !data) {
        // 缓存文件不存在，重新抓取数据
        https.get('https://ollama.com/library', (res) => {
          let html = '';

          res.on('data', (chunk) => {
            html += chunk;
          });

          res.on('end', () => {
            const $ = cheerio.load(html);
            const models = [] as Models;
            $('#repo li').each((_, element) => {
              const name = $(element).find('h2').text().trim();
              const type = $(element)
                .find('span[class*="bg-\\[\\#ddf4ff\\]"]')
                .map((i, el) => $(el).text().trim())
                .get()
                .join(', ');
              models.push({
                name: name || 'N/A',
                type: type || 'N/A',
              });
            });

            // 将数据写入缓存文件
            fs.writeFile(OLLAMA_MODEL_FILE, JSON.stringify({ date: Date.now(), models }), (err) => {
              if (err) return reject(err);
              resolve(models);
            });
          });

          res.on('error', (err) => reject(err));
        });
      } else {
        // 从缓存文件中读取数据
        const cachedData = JSON.parse(data.toString()) as {
          date: number;
          models: Models;
        };
        resolve(cachedData.models);
      }
    });
  });
};
