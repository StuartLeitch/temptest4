export class Config {
  dbUser: string;
  dbHost: string;
  dbDatabase: string;
  dbPassword: string;

  constructor() {
    this.dbUser = process.env.DB_USER;
    this.dbHost = process.env.DB_HOST;
    this.dbDatabase = process.env.DB_DATABASE;
    this.dbPassword = process.env.DB_PASSWORD;

  }
}

export async function makeConfig(): Promise<Config> {
  return new Config();
}

export const config = makeConfig();
