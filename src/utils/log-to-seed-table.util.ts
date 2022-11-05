import { createConnection } from './../connection';
import { ConnectionOptions } from "../connection";


export const logToSeedTable = async (seederName: string, options: ConnectionOptions) => {
  const connection = await createConnection(options);
  return await connection.query(`insert into "${options.seedsTableName || 'typeorm_seeds'}" values ('${seederName}')`)
}
