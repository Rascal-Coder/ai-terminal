#!/usr/bin/env node
import { Command } from 'commander';

import packageConfig from '../package.json' assert { type: 'json' };

import generatorHooks from './core/hooks';

import { initOllama, autoSetOllamaHost, getModel } from '@/core/ollama';
import { getConfig, setConfig, initConfig } from '@/core/config';
import { ConfigItem } from '@/types';
import { log } from '@/utils';

const { version } = packageConfig;
const program = new Command();
async function main() {
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
      console.log('setModel');
    });

  program
    .command('list [available]')
    .description('Show ollama model list')
    .action(async (argv) => {
      getModel(argv);
    });
  program.parse(process.argv);
}
main();
