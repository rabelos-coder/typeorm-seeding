const makeTemplate = ({ className }: { className: string }) => `/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Factory, Seeder } from 'rabeloscoder-typeorm-seeding';
import type { DataSource } from 'typeorm';

export default class ${className} implements Seeder {
  public async run(factory: Factory, connection: DataSource): Promise<any> {
    // add your logic here
  }
}`

export default makeTemplate
