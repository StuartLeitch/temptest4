const globalConfig: any = (window as any)._env_;

class Config {
  // * App Config ============================================================
  apiRoot: string;
  appName: string;
  backendUrl: string;
  gqlRoot: string;
  feRoot: string;

  // * Authentication ========================================================
  authEnabled: boolean;
  authServerUrl: string;
  authServerRealm: string;
  authServerClientId: string;
  authIdpHint: string;

  // * Site Config ===========================================================
  siteTitle: string;
  siteDescription: string;
  siteCanonicalUrl: string;
  siteKeywords: string;
  scssIncludes: any[];

  constructor() {
    this.appName = globalConfig.APP_NAME;
    this.apiRoot = globalConfig.API_ROOT;
    this.backendUrl = globalConfig.BACKEND_URL;
    this.gqlRoot = globalConfig.GQL_ROOT;
    this.feRoot = globalConfig.FE_ROOT;

    this.authEnabled = globalConfig.AUTH_ENABLED === 'true';
    this.authServerUrl = globalConfig.AUTH_SERVER_URL;
    this.authServerRealm = globalConfig.AUTH_SERVER_REALM;
    this.authServerClientId = globalConfig.AUTH_SERVER_CLIENT_ID;
    this.authIdpHint = globalConfig.AUTH_IDP_HINT;

    this.siteTitle = 'Invoicing Admin';
    this.siteDescription = 'Invoicing Admin Dashboard';
    this.siteCanonicalUrl = 'http://localhost:4200';
    this.siteKeywords = 'react dashboard seed bootstrap';
    this.scssIncludes = [];
  }
}

const config = new Config();
export default config;
