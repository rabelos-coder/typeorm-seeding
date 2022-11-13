import { createConnection } from './../connection.js';
import { ConnectionOptions } from "../connection.js";


export const logToSeedTable = async (seederName: string, options: ConnectionOptions) => {
  const connection = await createConnection(options);
  return await connection.query(`insert into "${options.seedsTableName || 'typeorm_seeds'}" values ('${seederName}')`)
}
