#!/usr/bin/env ts-node-esm
import 'reflect-metadata'
import yargs from 'yargs/yargs'
import { SeedCommand } from './commands/seed.command.js'
import { ConfigCommand } from './commands/config.command.js'
import { CreateCommand } from './commands/create.command.js'


yargs(process.argv.slice(2))
  .usage('Usage: $0 <command> [options]')
  .command(new ConfigCommand())
  .command(new SeedCommand())
  .command(new CreateCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('h', 'help').argv
