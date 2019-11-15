import path from 'path';
import { environment } from '@env/environment';

const dbConfig = {
  dbUser: process.env.DB_USERNAME || environment.DB_USERNAME,
  dbHost: process.env.DB_HOST || environment.DB_HOST,
  dbDatabase: process.env.DB_DATABASE || environment.DB_DATABASE,
  dbPassword: process.env.DB_PASSWORD,
  dbMigrationsDir:
    process.env.DB_MIGRATIONS_DIR ||
    path.join(__dirname, environment.DB_MIGRATIONS_DIR),
  dbSeedsDir:
    process.env.DB_SEEDS_DIR || path.join(__dirname, environment.DB_SEEDS_DIR)
};

export interface SalesForceConfig {
  user: string;
  password: string;
  loginUrl: string;
  securityToken: string;
}

export class Config {
  dbUser: string;
  dbHost: string;
  dbDatabase: string;
  dbPassword: string;
  dbMigrationsDir: string;
  dbSeedsDir: string;

  salesForce: SalesForceConfig;


  constructor() {
    return Object.assign({}, this, dbConfig);

    this.salesForce = {
      user: process.env.SAGE_USER,
      password: process.env.SAGE_PASSWORD,
      loginUrl: process.env.SAGE_LOGIN_URL,
      securityToken: process.env.SAGE_SECURITY_TOKEN,
    };
  }
}

export async function makeConfig(): Promise<Config> {
  return new Config();
}

export const config = makeConfig();
