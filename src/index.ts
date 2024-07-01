#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';

import packageConfig from '../package.json' assert { type: 'json' };

import generatorHooks from './core/hooks';
import { ollamaServer } from './utils/ollamaServer';

import { initOllama, autoSetOllamaHost } from '@/core/ollama';
import { getModel } from '@/core/model';
import { getConfig, setConfig, initConfig } from '@/core/config';
import { ConfigItem } from '@/types';
import { log } from '@/utils';

const { version } = packageConfig;
const program = new Command();
const main = async () => {
  try {
    await initConfig();
  } catch (error) {
    log.error(`Error reading config file: ${error}`);
    process.exit(1); // 如果无法确保配置文件存在，则退出进程
  }
  program.name('ai-terminal').description('ai terminal for you').version(version);
  program
    .command('init')
    .description('Initialize ai terminal')
    .action(() => {
      initOllama();
    });

  program
    .command('set <key> <value>')
    .description('Set a global configuration key and value')
    .action(async (key, value) => {
      try {
        await setConfig(key as keyof ConfigItem, value);
      } catch (error) {
        log.error(`Error reading config file: ${error}`);
      }
    });

  program
    .command('hooks <name>')
    .description('Add a new Hooks')
    .action(async (name) => {
      log.info(`Adding new Hooks: ${name}`);
      generatorHooks(name);
    });

  program
    .command('get <key>')
    .description('Get a global configuration value')
    .action(async (key) => {
      try {
        await getConfig(key);
      } catch (error) {
        log.error(`Error reading config file: ${error}`);
      }
    });

  program
    .command('setHost')
    .description('Set ollama service host')
    .action(async () => {
      try {
        await autoSetOllamaHost();
      } catch (error) {
        log.error(`Error setHost: ${error}`);
      }
    });

  program
    .command('setModel')
    .description('Set ollama service model')
    .action(async () => {
      const { inputModel } = await inquirer.prompt({
        type: 'input',
        name: 'inputModel',
        message: 'Enter the model name:',
      });
      try {
        const ollama = await ollamaServer();
        const res = await ollama.list();
        const modelExists = res.models.some((model) => model.name === inputModel);

        if (modelExists) {
          setConfig('OLLAMA_MODEL', inputModel);
        } else {
          log.error(`Model '${inputModel}' does not exist.`);
          log.warning('Please use the command "ai list" to view available models.');
        }
      } catch (error) {
        log.error(`Error: ${error}`);
      }
    });

  program
    .command('list [available]')
    .description('Show ollama model list')
    .action(async (argv) => {
      getModel(argv);
    });
  program.parse(process.argv);
};

main();
