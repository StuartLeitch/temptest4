import {
  Connection,
  RecordResult,
  SuccessResult,
  UserInfo,
  ErrorResult
} from 'jsforce';
import {
  ErpData,
  ErpServiceContract,
  InvoiceItemType,
  Payer,
  Invoice,
  PayerType,
  InvoiceItem,
  Address,
  Article,
  Journal
} from '@hindawi/shared';
import { Config } from '../../config';

function ensureSuccess(result: RecordResult): SuccessResult {
  if (!result.success) {
    throw result;
  }

  return result;
}

export interface ErpFixedValues {
  tradeDocumentType: string;
  currencyId: string;
  companyId: string;
}

export const defaultErpFixedValues: ErpFixedValues = {
  tradeDocumentType: 'a650Y000000boz4QAA',
  currencyId: 'a5W0Y000000GnlcUAC',
  companyId: 'a5T0Y000000TR3pUAG'
};

export class ErpService implements ErpServiceContract {
  private connection: Connection;
  private loginPromise: Promise<SuccessResult | ErrorResult | UserInfo>;

  constructor(
    private config: Config,
    private fixedValues: ErpFixedValues = defaultErpFixedValues
  ) {}

  async registerInvoice(data: ErpData): Promise<true> {
    const { payer, invoice, article, journal, items } = data;

    const accountId = await this.registerPayer(data);
    const tradeDocumentId = await this.registerTradeDocument(accountId, data);

    const tradeItemIds = await Promise.all(
      items.map(item => this.registerInvoiceItem(tradeDocumentId, data, item))
    );

    return true;
  }

  async registerPayment(payment): Promise<boolean> {
    // TODO
    return true;
  }

  private async getConnection(): Promise<Connection> {
    const { user, password, securityToken, loginUrl } = this.config.salesForce;

    if (!this.connection) {
      this.connection = new Connection({
        loginUrl
      });

      this.loginPromise =
        this.loginPromise ||
        this.connection.login(user, password + securityToken);

      this.connection.authorize;
      await this.loginPromise;
    }

    return this.connection;
  }

  private async registerPayer(data: Partial<ErpData>): Promise<string> {
    const connection = await this.getConnection();

    const { article, payer } = data;

    const name =
      payer.type === PayerType.INDIVIDUAL
        ? `${payer.name.value} ${article.manuscriptId}`
        : `${payer.organization.value} ${article.manuscriptId}`;

    const account = await connection.sobject('Account').create({
      Name: name.slice(0, 70),
      AccountNumber: article.manuscriptId,
      BillingAddress: payer.billingAddressId,
      s2cor__Country_Code__c: payer.country,
      s2cor__Registration_Number_Type__c: 'VAT Registration Number',
      s2cor__VAT_Registration_Number__c: payer.VATId
    });

    const payerEmail = payer.email.value;

    if (!account.success) {
      throw account;
    }

    const existingContact = await connection
      .sobject('Contact')
      .select({ id: true })
      .where({ Email: payerEmail })
      .execute();

    if (!existingContact) {
      const names = payer.name.value.split(' ');
      const firstName = names[0];
      names.shift();
      const lastName = names.join(' ');

      await connection.sobject('Contact').create({
        AccountId: account.id,
        Email: payerEmail,
        FirstName: firstName,
        LastName: lastName
      });
    }

    return account.id;
  }

  private async registerTradeDocument(
    accountId: string,
    data: Partial<ErpData>
  ): Promise<string> {
    const connection = await this.getConnection();
    const { invoice, journal, article, payer } = data;
    const invoiceDate = invoice.dateCreated;
    const fixedValues = this.fixedValues;

    const description = `${journal.name} - Article Processing Charges for article ${article.manuscriptId}`;

    const tradeDocument = await connection
      .sobject('s2cor__Sage_INV_Trade_Document__c')
      .create({
        s2cor__Account__c: accountId,
        s2cor__Approval_Status__c: 'Approved',
        s2cor__Company__c: fixedValues.companyId,
        s2cor__Currency__c: fixedValues.currencyId,
        s2cor__Date__c: invoiceDate,
        s2cor__Posting_Date__c: invoiceDate,
        s2cor__Operation_Date__c: invoiceDate,
        s2cor__Manual_Due_Date__c: invoiceDate,
        s2cor__Reference__c: invoice.invoiceNumber,
        s2cor__Status__c: 'Submitted',
        s2cor__Trade_Document_Type__c: fixedValues.tradeDocumentType,
        s2cor__Legal_Note__c: this.getVatNote(payer),
        // s2cor__BillingCountry__c: '<payer.countryName>',
        // s2cor__BillingCity__c: '<payer.city>',
        // s2cor__BillingStreet__c: '<payer.address>',
        s2cor__Description__c: description
      });

    if (!tradeDocument.success) {
      throw tradeDocument;
    }

    return tradeDocument.id;
  }

  private async registerInvoiceItem(
    tradeDocumentId: string,
    data: Partial<ErpData>,
    invoiceItem: InvoiceItem
  ): Promise<string> {
    const connection = await this.getConnection();
    const { journal, article } = data;

    const description =
      invoiceItem.type === 'APC'
        ? `${journal.name} - Article Processing Charges for article ${article.manuscriptId}`
        : `${journal.name} - Article Reprint Charges for article ${article.manuscriptId}`;

    const tradeItem = await connection
      .sobject('s2cor__Sage_INV_Trade_Document_Item__c')
      .create({
        s2cor__Trade_Document__c: tradeDocumentId,
        s2cor__Description__c: description,
        s2cor__Discount_Type__c: 'Amount',
        s2cor__Quantity__c: '1',
        s2cor__Tax_Code__c: 'a680Y0000000CvBQAU', // TODO
        s2cor__Tax_Treatment__c: 'a6B0Y000000fyOuUAI', // TODO
        s2cor__Unit_Price__c: invoiceItem.price,
        s2cor__Product__c: '01t0Y000002BuB9QAK', // TODO to be determined based on journal ownership
        s2cor__Discount_Amount__c: '0' // TODO fetch from applied coupons/waivers
      });

    if (!tradeItem.success) {
      throw tradeItem;
    }

    return tradeItem.id;
  }

  private getTaxCode(payer: Payer): string {
    // TODO datermine this based on payer country and VAT number
    return '';
  }

  private get TaxType(): string {
    // TODO datermine this based on payer country and VAT number
    return '';
  }

  private getVatNote(payer: Payer): string {
    // TODO datermine this based on payer country and VAT number
    return 'vat note to be computed';
  }
}
