import readPackage from 'read-pkg'
import chalk from 'chalk'
import ora, { Ora } from 'ora'
import * as yargs from 'yargs'
import { configureConnection, ConnectionOptions, getConnectionOptions } from '../connection.js'
import * as fs from 'fs'
import path from 'path'
import _ from 'lodash'
import makeTemplate from '../templates/create-seeder.template.js'

interface IArgs {
  fileName: string
  datasource: string
  root: string
  connection: string
}

export class CreateCommand implements yargs.CommandModule {
  command = 'create'
  describe = 'Creates a new seeder file'

  builder(args: yargs.Argv) {
    //
    return args
      .option('f', {
        alias: 'fileName',
        default: '',
        describe: 'the name of the seeder file to be created',
      })
      .option('d', {
        alias: 'datasource',
        default: '',
        describe: 'Name of the typeorm datasource file (json or js).',
      })
      .option('r', {
        alias: 'root',
        default: process.cwd(),
        describe: 'Path to your typeorm config file',
      })
  }

  async handler(args: yargs.Arguments<IArgs>) {
    const log = console.log
    const pkg = await readPackage({ cwd: path.join(process.cwd(), 'node_modules/rabeloscoder-typeorm-seeding') })
    log('🌱  ' + chalk.bold(`TypeORM Seeding v${(pkg as any).version}`))

    const spinner = ora('Loading ormconfig').start()
    const configureOption = {
      root: args.root,
      configName: args.datasource,
      connection: args.connection,
    }

    // Get TypeORM config file
    let option: ConnectionOptions
    try {
      configureConnection(configureOption)
      option = (await getConnectionOptions()) as ConnectionOptions
      spinner.succeed('ORM Config loaded')
    } catch (error) {
      panic(spinner, error, 'Could not load the config file!')
      return
    }

    let seedsDir = 'src/database/seeds'

    if (!option?.cli?.seedsDir) {
      return panic(spinner, new Error('NO_CLI_SEEDS_DIR'), 'cli.seedsDir was not set in the ormconfig file')
    } else {
      seedsDir = option.cli.seedsDir
    }

    if (!args.fileName) {
      return panic(
        spinner,
        new Error('NO_FILE_NAME'),
        'no filename entered, please use -f or --fileName to specify the filename',
      )
    }

    spinner.start('Creating file')
    const now = Date.now()
    const fileName = `${now}-${_.kebabCase(args.fileName)}`
    const className = `${_.upperFirst(_.camelCase(args.fileName))}${now}`

    try {
      if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, { recursive: true })
      }
      fs.writeFileSync(path.join(seedsDir, fileName + '.ts'), makeTemplate({ className }))
      spinner.succeed(`File: ${fileName}.ts created successfully`)
    } catch (error) {
      panic(spinner, error, 'Error creating file')
    }

    process.exit(0)
  }
}

function panic(spinner: Ora, error: Error, message: string) {
  spinner.fail(message)
  console.error(error)
  process.exit(1)
}
