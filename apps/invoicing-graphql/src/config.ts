import path from 'path';

export class Config {
  dbUser: string;
  dbHost: string;
  dbDatabase: string;
  dbPassword: string;
  dbMigrationsDir: string;

  constructor() {
    this.dbHost = process.env.DB_HOST;
    this.dbUser = process.env.DB_USERNAME;
    this.dbPassword = process.env.DB_PASSWORD;
    this.dbDatabase = process.env.DB_DATABASE;
    this.dbMigrationsDir =
      process.env.DB_MIGRATIONS_DIR ||
      path.join(
        __dirname,
        '../../../libs/shared/src/lib/infrastructure/database/knex/migrations'
      );
  }
}

export async function makeConfig(): Promise<Config> {
  return new Config();
}

export const config = makeConfig();
