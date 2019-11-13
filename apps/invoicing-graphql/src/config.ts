import path from 'path';
import {environment} from '@env/environment';

const dbConfig = {
  dbUser: process.env.DB_USERNAME || environment.DB_USERNAME,
  dbHost: process.env.DB_HOST || environment.DB_HOST,
  dbDatabase: process.env.DB_DATABASE || environment.DB_DATABASE,
  dbPassword: process.env.DB_PASSWORD || environment.DB_PASSWORD,
  dbMigrationsDir:
    process.env.DB_MIGRATIONS_DIR ||
    path.join(__dirname, environment.DB_MIGRATIONS_DIR)
};

export class Config {
  dbUser: string;
  dbHost: string;
  dbDatabase: string;
  dbPassword: string;
  dbMigrationsDir: string;

  constructor() {
    return Object.assign({}, this, dbConfig);
  }
}

export async function makeConfig(): Promise<Config> {
  return new Config();
}

export const config = makeConfig();
