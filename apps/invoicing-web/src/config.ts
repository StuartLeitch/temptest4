const globalConfig: any = (window as any)._env_;

export class Config {
  env: "development" | "production";
  tenantName: string;
  tenantCountry: string;
  appUrl: string;
  apiRoot: string;
  gqlRoot: string;
  paypallClientId: string;
  doiNumber: string;

  authEnabled: boolean;
  authServerUrl: string;
  authServerRealm: string;
  authServerClientId: string;

  footerHomeLink: string;
  footerPrivacy: string;
  footerEmail: string;
  footerTOS: string;

  appName: string;
  invoicesPerPage: number;

  faviconUrl: string;
  logoUrl: string;

  bankDetails: {
    accountName: string;
    accountType: string;
    accountNumber: string;
    sortCode: string;
    swift: string;
    iban: string;
    bankAddress: string;
    beneficiaryAddress: string;
    accountCurrency: string;
  };

  constructor() {
    this.env = globalConfig.NODE_ENV || "development";
    this.appUrl = globalConfig.APP_URL;
    this.apiRoot = globalConfig.API_ROOT;
    this.gqlRoot = globalConfig.GQL_ROOT;
    this.paypallClientId = globalConfig.PP_CLIENT_ID;
    this.doiNumber = globalConfig.DOI_NUMBER;

    this.authEnabled = globalConfig.AUTH_ENABLED === "true";
    this.authServerUrl = globalConfig.AUTH_SERVER_URL;
    this.authServerRealm = globalConfig.AUTH_SERVER_REALM;
    this.authServerClientId = globalConfig.AUTH_SERVER_CLIENT_ID;

    this.footerHomeLink = globalConfig.FOOTER_HOME_LINK;
    this.footerPrivacy = globalConfig.FOOTER_PRIVACY;
    this.footerEmail = globalConfig.FOOTER_EMAIL;
    this.tenantName = globalConfig.TENANT_NAME;
    this.tenantCountry = globalConfig.TENANT_COUNTRY;
    this.footerTOS = globalConfig.FOOTER_TOS;

    this.appName = globalConfig.APP_NAME;

    this.invoicesPerPage = Number(globalConfig.INVOICES_PER_PAGE);

    this.faviconUrl = globalConfig.FAVICON_URL;
    this.logoUrl = globalConfig.LOGO_URL;

    this.bankDetails = {
      accountName: globalConfig.BANK_ACCOUNT_NAME,
      accountType: globalConfig.BANK_ACCOUNT_TYPE,
      accountNumber: globalConfig.BANK_ACCOUNT_NUMBER,
      sortCode: globalConfig.BANK_SORT_CODE,
      swift: globalConfig.BANK_SWIFT,
      iban: globalConfig.BANK_IBAN,
      bankAddress: globalConfig.BANK_ADDRESS,
      beneficiaryAddress: globalConfig.BANK_BENEFICIARY_ADDRESS,
      accountCurrency: globalConfig.BANK_ACCOUNT_ADDRESS,
    };
  }
}

export const config = new Config();
