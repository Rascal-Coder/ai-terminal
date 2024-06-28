#!/usr/bin/env node
import { Command } from "commander";
import { initOllama } from "@/core/ollama";
import { getConfig, setConfig } from "@/core/config";
import { ConfigItem } from '@/types';
import { log } from "@/utils";
import packageConfig from '../package.json' assert { type: 'json' };

const { version } = packageConfig;
const program = new Command();
function main() {

  program
    .name("ai-terminal")
    .description("ai terminal for you")
    .version(version);
  program
    .command("init")
    .description("Initialize ai terminal")
    .action(() => {
      initOllama();
    });


  program
    .command("set <key> <value>")
    .description("Set a global configuration key and value")
    .action(async (key, value) => {
      try {
        await setConfig(key as keyof ConfigItem, value);
      } catch (error) {
        log.error(`Error reading config file: ${error}`);
      }
    });

  program
    .command("get <key>")
    .description("Get a global configuration value")
    .action(async (key) => {
      try {
        await getConfig(key);
      } catch (error) {
        log.error(`Error reading config file: ${error}`);
      }
    });

    program.parse(process.argv);
}
main();
