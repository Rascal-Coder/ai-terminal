#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import chalk from 'chalk';

import packageConfig from '../package.json' assert { type: 'json' };

import { ollamaServer } from '@/utils/ollamaServer';
import generatorHooks from '@/core/hooks';
import createComponents from '@/core/components';
import commitMessage from '@/core/commit';
import aiCodeReview from '@/core/code-review';
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
  program
    .name('ai-cli')
    .description(`👏欢迎使用${chalk.green('[ai-cli]')}`)
    .version(version);
  program
    .command('init')
    .description('Initialize ai cli')
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
    .action((name) => {
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
      try {
        const ollama = await ollamaServer();
        const res = await ollama.list();
        const models = res.models.map((model) => model.name);

        const { selectedModel } = await inquirer.prompt({
          type: 'list',
          name: 'selectedModel',
          message: 'Select the model:',
          choices: models,
        });

        setConfig('OLLAMA_MODEL', selectedModel);
      } catch (error) {
        log.error(`Error: ${error}`);
      }
    });

  program
    .command('commit')
    .description(
      'Generate a commit message\nAI will automatically generate submission information for you',
    )
    .action(() => {
      commitMessage();
    });

  program
    .command('component <name> [path]')
    .description('Add a new component')
    .action((name, path) => {
      createComponents({ componentName: name, componentPath: path });
    });

  program
    .command('review [path]')
    .description(
      'Generate a code review\nAI will automatically generate code review information for you',
    )
    .action((path) => {
      aiCodeReview(path);
    });
  program
    .command('list [available]')
    .description('Show ollama model list')
    .action((argv) => {
      getModel(argv);
    });

  program.addHelpText('after', () => {
    const table = new Table({
      head: [chalk.cyan('Command'), chalk.cyan('Description')],
    });

    table.push(
      [chalk.cyan('init'), 'Initialize AI cli'],
      [
        chalk.cyan('set <key> <value>'),
        'Set a global configuration key and value.\n\nParameters:\n  key: The configuration key\n  value: The value to set\n\nExample:\n  ' +
          chalk.green('$ ai set OLLAMA_MODEL llama2:latest'),
      ],
      [
        chalk.cyan('hooks <name>'),
        'Add a new Hooks.\n\nParameters:\n  name: The name of the hooks\n\nExample:\n  ' +
          chalk.green('$ ai hooks useCustomHook'),
      ],
      [
        chalk.cyan('get <key>'),
        'Get a global configuration value.\n\nParameters:\n  key: The configuration key to retrieve\n\nExample:\n  ' +
          chalk.green('$ ai get username'),
      ],
      [
        chalk.cyan('component <name> [path]'),
        'Add a new component.\n\nParameters:\n  name: The name of the component\n  path: (Optional) The path to add the component\n\nExample:\n  ' +
          chalk.green('$ ai component Button src/components'),
      ],
      [
        chalk.cyan('commit'),
        'Generate a commit message. AI will automatically generate submission information for you.\n\nExample:\n  ' +
          chalk.green('$ ai commit'),
      ],
      [
        chalk.cyan('review'),
        'Generate a code review. AI will automatically generate code review information for you.\n\nExample:\n  ' +
          chalk.green('$ ai review'),
      ],
      [
        chalk.cyan('setHost'),
        'Set Ollama service host.\n\nExample:\n  ' + chalk.green('$ ai setHost'),
      ],
      [
        chalk.cyan('setModel'),
        'Set Ollama service model.\n\nExample:\n  ' + chalk.green('$ ai setModel'),
      ],
      [
        chalk.cyan('list [available]'),
        'Show Ollama model list.\n\nParameters:\n  available: (Optional) Show available models\n\nExample:\n  ' +
          chalk.green('$ ai list'),
      ],
    );

    return `\n${table.toString()}\n`;
  });

  program.parse(process.argv);
};

main();
