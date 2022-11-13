const makeTemplate = ({className}: {className: string}) => `
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-default-export */
import type { Factory, Seeder } from '@paranode/typeorm-seeding';
import type { DataSource } from 'typeorm';

export default class ${className} implements Seeder {
  public async run(factory: Factory, connection: DataSource): Promise<any> {
    // add your logic here
  }
}
`;

export default makeTemplate;
