const globalConfig: any = (window as any)._env_;

export class Config {
  env: 'development' | 'production';
  appUrl: string;
  apiRoot: string;
  gqlRoot: string;
  paypallClientId: string;

  authServerUrl: string;
  authServerRealm: string;
  authServerClientId: string;

  constructor() {
    this.env = globalConfig.NODE_ENV || 'development';
    this.appUrl = globalConfig.APP_URL;
    this.apiRoot = globalConfig.API_ROOT;
    this.gqlRoot = globalConfig.GQL_ROOT;
    this.paypallClientId = globalConfig.PP_CLIENT_ID;

    this.authServerUrl = globalConfig.AUTH_SERVER_URL;
    this.authServerRealm = globalConfig.AUTH_SERVER_REALM;
    this.authServerClientId = globalConfig.AUTH_SERVER_CLIENT_ID;
  }

}

export const config = new Config();
