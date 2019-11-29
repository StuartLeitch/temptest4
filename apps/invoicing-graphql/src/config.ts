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

export interface PayPalConfig {
  clientSecret: string;
  environment: string;
  clientId: string;
}

export class Config {
  dbUser: string;
  dbHost: string;
  dbDatabase: string;
  dbPassword: string;
  dbMigrationsDir: string;
  dbSeedsDir: string;

  salesForce: SalesForceConfig;
  payPal: PayPalConfig;

  feRoot: string;

  constructor() {
    Object.assign(this, dbConfig);

    this.salesForce = {
      user: process.env.SAGE_USER,
      password: process.env.SAGE_PASSWORD,
      loginUrl: process.env.SAGE_LOGIN_URL,
      securityToken: process.env.SAGE_SECURITY_TOKEN
    };

    this.payPal = {
      clientSecret: process.env.PP_CLIENT_SECRET,
      environment: process.env.PP_ENVIRONMENT,
      clientId: process.env.PP_CLIENT_ID
    };
  }
}

export function makeConfig(): Config {
  return new Config();
}

export const config = makeConfig();
