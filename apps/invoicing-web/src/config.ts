const globalConfig: any = (window as any)._env_;

export class Config {
  env: 'development' | 'production';
  appUrl: string;
  apiRoot: string;
  gqlRoot: string;
  paypallClientId: string;

  constructor() {
    this.env = globalConfig.NODE_ENV || 'development';
    this.appUrl = globalConfig.APP_URL;
    this.apiRoot = globalConfig.API_ROOT;
    this.gqlRoot = globalConfig.GQL_ROOT;
    this.paypallClientId = globalConfig.PP_CLIENT_ID;
  }

}

export const config = new Config();
