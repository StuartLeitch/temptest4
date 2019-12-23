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
  tenantName: string;
  tenantCountry: string;
  dbUser: string;
  dbHost: string;
  dbDatabase: string;
  dbPassword: string;
  dbMigrationsDir: string;
  dbSeedsDir: string;

  salesForce: SalesForceConfig;
  payPal: PayPalConfig;

  feRoot: string;

  sanctionedCountryNotificationReceiver: string;
  sanctionedCountryNotificationSender: string;

  invoicePaymentBankTransferCopyReceiverAddress: string;
  invoicePaymentEmailSenderAddress: string;
  invoicePaymentEmailSenderName: string;

  constructor() {
    Object.assign(this, dbConfig);

    this.tenantName = process.env.TENANT_NAME;
    this.tenantCountry = process.env.TENANT_COUNTRY;

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

    this.sanctionedCountryNotificationReceiver =
      process.env.SANCTIONED_COUNTRY_NOTIFICATION_RECEIVER;
    this.sanctionedCountryNotificationSender =
      process.env.SANCTIONED_COUNTRY_NOTIFICATION_SENDER;

    this.invoicePaymentBankTransferCopyReceiverAddress =
      process.env.INVOICE_PAYMENT_EMAIL_BANK_TRANSFER_COPY_RECEIVER;
    this.invoicePaymentEmailSenderAddress =
      process.env.INVOICE_PAYMENT_EMAIL_SENDER_ADDRESS;
    this.invoicePaymentEmailSenderName =
      process.env.INVOICE_PAYMENT_EMAIL_SENDER_NAME;
  }
}

export function makeConfig(): Config {
  return new Config();
}

export const config = makeConfig();
