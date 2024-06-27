#!/usr/bin/env node
import { Command } from "commander";
import { initOllama } from "./utils/ollama";
function main() {
  const program = new Command();

  program.name("ollama-cli").description("A CLI for Ollama").version("0.0.1");
  program
    .command("init")
    .description("Initialize Ollama")
    .action(() => {
      initOllama()
    });
  program.parse(process.argv);
}
main();