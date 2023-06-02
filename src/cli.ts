#!/usr/bin/env node
import 'reflect-metadata'
import yargs from 'yargs/yargs'
import { SeedCommand } from './commands/seed.command'
import { ConfigCommand } from './commands/config.command'
import { CreateCommand } from './commands/create.command'
import { CommandModule } from 'yargs'


yargs(process.argv.slice(2))
  .usage('Usage: $0 <command> [options]')
  .command(new ConfigCommand() as CommandModule)
  .command(new SeedCommand() as CommandModule)
  .command(new CreateCommand() as CommandModule)
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .help('h')
  .alias('h', 'help').argv
