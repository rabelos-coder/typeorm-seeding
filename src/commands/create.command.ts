import * as chalk from "chalk";
import * as ora from "ora";
import { getConnectionOptions } from "typeorm";
import * as yargs from "yargs";
import { configureConnection, ConnectionOptions } from "../connection";
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import makeTemplate from "../templates/create-seeder.template";

export class CreateCommand implements yargs.CommandModule {
  command = 'create';
  describe = 'Creates a new seeder file';

  builder(args: yargs.Argv) {
    //
    return args
    .option('f', {
      alias: 'fileName',
      default: '',
      describe: 'the name of the seeder file to be created'
    })
    .option('n', {
      alias: 'configName',
      default: '',
      describe: 'Name of the typeorm config file (json or js).',
    })
    .option('c', {
      alias: 'connection',
      default: '',
      describe: 'Name of the typeorm connection',
    })
    .option('r', {
      alias: 'root',
      default: process.cwd(),
      describe: 'Path to your typeorm config file',
    });
  }

  async handler(args: yargs.Arguments) {
    const log = console.log;
    const pkg = require('../../package.json');
    log('🌱  ' + chalk.bold(`TypeORM Seeding v${(pkg as any).version}`));

    const spinner = ora('Loading ormconfig').start()
    const configureOption = {
      root: args.root as string,
      configName: args.configName as string,
      connection: args.connection as string,
    }

    // Get TypeORM config file
    let option: ConnectionOptions
    try {
      configureConnection(configureOption)
      option = await getConnectionOptions() as ConnectionOptions;
      spinner.succeed('ORM Config loaded')

    } catch (error) {
      panic(spinner, error, 'Could not load the config file!')
    }

    let seedsDir = 'src/database/seeds';

    if(!option?.cli?.seedsDir) {
      return panic(spinner, new Error('NO_CLI_SEEDS_DIR'), 'cli.seedsDir was not set in the ormconfig file');
    } else {
      seedsDir = option.cli.seedsDir;
    }

    if(!args.fileName) {
      return panic(spinner, new Error('NO_FILE_NAME'), 'no filename entered, please use -f or --fileName to specify the filename');
    }

    spinner.start('Creating file');
    const now = Date.now();
    const fileName = `${now}-${_.kebabCase(args.fileName as string)}`;
    const className = `${_.upperFirst(_.camelCase(args.fileName as string))}${now}`;

    try {
      fs.writeFileSync(path.join(seedsDir, fileName + '.ts'), makeTemplate({className}));
      spinner.succeed(`File: ${fileName}.ts created successfully`);
    } catch(error) {
      panic(spinner, error, 'Error creating file');
    }

    process.exit(0);

  }
}


function panic(spinner: ora.Ora, error: Error, message: string) {
  spinner.fail(message)
  console.error(error)
  process.exit(1)
}
