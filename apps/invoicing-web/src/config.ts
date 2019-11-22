const globalConfig: any = (window as any)._env_;

export class Config {
  env: "development" | "production";
  appUrl: string;
  apiRoot: string;
  gqlRoot: string;
  paypallClientId: string;

  authServerUrl: string;
  authServerRealm: string;
  authServerClientId: string;

  footerHomeLink: string;
  footerPrivacy: string;
  footerEmail: string;
  tenantName: string;
  footerTOS: string;

  constructor() {
    this.env = globalConfig.NODE_ENV || "development";
    this.appUrl = globalConfig.APP_URL;
    this.apiRoot = globalConfig.API_ROOT;
    this.gqlRoot = globalConfig.GQL_ROOT;
    this.paypallClientId = globalConfig.PP_CLIENT_ID;

    this.authServerUrl = globalConfig.AUTH_SERVER_URL;
    this.authServerRealm = globalConfig.AUTH_SERVER_REALM;
    this.authServerClientId = globalConfig.AUTH_SERVER_CLIENT_ID;

    this.footerHomeLink = globalConfig.FOOTER_HOME_LINK;
    this.footerPrivacy = globalConfig.FOOTER_PRIVACY;
    this.footerEmail = globalConfig.FOOTER_EMAIL;
    this.tenantName = globalConfig.TENANT_NAME;
    this.footerTOS = globalConfig.FOOTER_TOS;
  }
}

export const config = new Config();
