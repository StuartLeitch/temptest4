/* eslint-disable @typescript-eslint/camelcase */
import { Connection } from 'jsforce';
import {
  ErpData,
  ErpServiceContract,
  PayerType,
  InvoiceItem,
  ErpResponse
} from '@hindawi/shared';
import countryList from 'country-list';

interface ErpFixedValues {
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
  private loginPromise: Promise<any>;

  constructor(
    private readonly logger: any,
    private config: any,
    private fixedValues: ErpFixedValues = defaultErpFixedValues
  ) {
    this.logger.setScope('ErpService');
  }

  async registerInvoice(data: ErpData): Promise<ErpResponse> {
    const { items, tradeDocumentItemProduct } = data;

    const accountId = await this.registerPayer(data);
    const tradeDocumentId = await this.registerTradeDocument(accountId, data);

    const tradeItemIds = await Promise.all(
      items.map(async item =>
        this.registerInvoiceItem(
          tradeDocumentId,
          data,
          item,
          tradeDocumentItemProduct
        )
      )
    );

    return {
      accountId,
      tradeDocumentId,
      tradeItemIds
    };
  }

  public async registerRevenueRecognition(data: any): Promise<any> {
    const journal = await this.registerJournal(data);

    if (journal == null) {
      return null;
    }

    const journalItem = await this.registerJournalItem({
      journal,
      ...data
    });
    const journalTags = await this.registerJournalTags({ journal, ...data });
    const journalItemTag = await this.registerJournalItemTag({
      journalItem,
      ...data
    });

    return {
      journal,
      journalItem,
      journalTags,
      journalItemTag
    };
  }

  private async getConnection(): Promise<Connection> {
    const { user, password, securityToken, loginUrl } = this.config;

    if (!this.connection) {
      this.connection = new Connection({
        loginUrl
      });

      this.loginPromise = this.connection.login(user, password + securityToken);

      // tslint:disable-next-line: no-unused-expression
      this.connection.authorize;
      await this.loginPromise;
      // TODO: Log this message in the banner
      this.logger.info('ERP login successful');
    }

    return this.connection;
  }

  private async registerPayer(data: Partial<ErpData>): Promise<string> {
    this.logger.info('Register payer');
    const connection = await this.getConnection();

    const { article, payer, billingAddress } = data;

    let name =
      payer.type === PayerType.INDIVIDUAL
        ? `${payer.name.value} ${article.customId}`
        : `${payer.organization.value} ${article.customId}`;
    name = name.slice(0, 70);

    const accountData = {
      Name: name,
      AccountNumber: article.customId,
      // BillingAddress:{Street: billingAddress.addressLine1},
      s2cor__Country_Code__c: billingAddress.country,
      s2cor__Registration_Number_Type__c: 'VAT Registration Number',
      s2cor__VAT_Registration_Number__c: payer.VATId
    };

    const existingAccount = await connection
      .sobject('Account')
      .select({ id: true })
      .where({ Name: name })
      .execute();

    let account;
    if (existingAccount.length) {
      account = existingAccount[0];
      account.id = account.Id || account.id;
      console.log('Account object reused: ', account.id);
    } else {
      account = await connection.sobject('Account').create(accountData);
      if (!account.success) {
        throw account;
      }
      console.log('Account object registered: ', account.id);
    }

    const payerEmail = payer.email.value;

    const names = payer.name.value.split(' ');
    const firstName = names[0];
    names.shift();
    const lastName = names.join(' ') || '---';

    const existingContact = await connection
      .sobject('Contact')
      .select({ Id: true })
      .where({
        Email: payerEmail
      })
      .execute();

    if (existingContact.length) {
      console.log('Contact object reused: ', (existingContact[0] as any).Id);
      return account.id;
    }

    const contact = await connection.sobject('Contact').create({
      AccountId: account.id,
      Email: payerEmail,
      FirstName: firstName,
      LastName: lastName
    });

    if (!contact.success) {
      throw contact;
    }

    console.log('Contact object registered: ', contact.id);

    return account.id;
  }

  private async registerTradeDocument(
    accountId: string,
    data: Partial<ErpData>
  ): Promise<string> {
    const connection = await this.getConnection();
    const {
      invoice,
      article,
      items,
      billingAddress,
      journalName,
      vatNote,
      rate
    } = data;
    const invoiceDate = invoice.dateIssued;
    const fixedValues = this.fixedValues;
    let referenceNumber;

    if (invoice.invoiceNumber && invoice.dateAccepted) {
      referenceNumber = invoice.referenceNumber;
    }

    const description = `${journalName} - Article Processing Charges for article ${article.customId}`;
    const tradeDocumentObject = {
      s2cor__Account__c: accountId,
      s2cor__Approval_Status__c: 'Approved',
      s2cor__Company__c: fixedValues.companyId,
      s2cor__Currency__c: fixedValues.currencyId,
      s2cor__Date__c: invoiceDate,
      s2cor__Posting_Date__c: invoiceDate,
      s2cor__Operation_Date__c: invoiceDate,
      s2cor__Manual_Due_Date__c: invoiceDate,
      s2cor__Reference__c: referenceNumber,
      s2cor__Status__c: 'Unsubmitted',
      s2cor__Trade_Document_Type__c: fixedValues.tradeDocumentType,
      s2cor__Legal_Note__c: this.getVatNote(vatNote, items, rate),
      s2cor__BillingCountry__c: countryList.getName(billingAddress.country),
      s2cor__BillingCity__c: billingAddress.city,
      s2cor__BillingStreet__c: billingAddress.addressLine1,
      s2cor__Description__c: description
    };

    const existingTradeDocument = await connection
      .sobject('s2cor__Sage_INV_Trade_Document__c')
      .find({
        s2cor__Reference__c: referenceNumber,
        s2cor__Account__c: accountId
      })
      .execute();

    if (existingTradeDocument.length) {
      const id = (existingTradeDocument[0] as any).Id;
      console.log('Reusing trade document', id);
      return id;
    }
    const tradeDocument = await connection
      .sobject('s2cor__Sage_INV_Trade_Document__c')
      .create(tradeDocumentObject);

    if (!tradeDocument.success) {
      throw tradeDocument;
    }

    this.logger.info('Trade Document registered: ', tradeDocument.id);

    return tradeDocument.id;
  }

  /**
   * Only allows one item currently
   * @param tradeDocumentId
   * @param data
   * @param invoiceItem
   */
  private async registerInvoiceItem(
    tradeDocumentId: string,
    data: Partial<ErpData>,
    invoiceItem: InvoiceItem,
    product: string
  ): Promise<string> {
    const connection = await this.getConnection();
    const { journalName, article, payer, vatNote } = data;
    const discountAmount = invoiceItem.price - invoiceItem.calculatePrice();
    const description =
      invoiceItem.type === 'APC'
        ? `${journalName} - Article Processing Charges for article ${article.customId}`
        : `${journalName} - Article Reprint Charges for article ${article.customId}`;
    const tdObj = {
      s2cor__Trade_Document__c: tradeDocumentId,
      s2cor__Description__c: description,
      s2cor__Quantity__c: '1',
      s2cor__Tax_Code__c: this.getTaxCode(vatNote),
      s2cor__Tax_Treatment__c: this.getTaxTreatment(vatNote),
      s2cor__Unit_Price__c: invoiceItem.price,
      s2cor__Product__c: product, //'01t0Y000002BuB9QAK', // TODO to be determined based on journal ownership
      s2cor__Discount_Type__c: 'Amount',
      s2cor__Discount_Amount__c: discountAmount,
      s2cor__Discount_Value__c: discountAmount,
      s2cor__Tax_Amount__c:
        (invoiceItem.vat / 100) * invoiceItem.calculatePrice(),
      s2cor__Tax_Rates__c: invoiceItem.vat.toString()
    };

    const existingTradeItems = await connection
      .sobject('s2cor__Sage_INV_Trade_Document_Item__c')
      .find({ s2cor__Trade_Document__c: tradeDocumentId });

    if (existingTradeItems.length) {
      const invoiceItemsToDelete = existingTradeItems.map(ii => (ii as any).Id);

      console.log('Deleting invoice items: ', invoiceItemsToDelete);

      const deleteResponses = await connection
        .sobject('s2cor__Sage_INV_Trade_Document_Item__c')
        .delete(invoiceItemsToDelete);

      for (const deleteResponse of deleteResponses) {
        if (!deleteResponse.success) {
          throw deleteResponse;
        }
      }
    }

    const tradeItem = await connection
      .sobject('s2cor__Sage_INV_Trade_Document_Item__c')
      .create(tdObj);

    if (!tradeItem.success) {
      throw tradeItem;
    }

    console.log('Trade Document Item: ', tradeItem.id);

    return tradeItem.id;
  }

  private getTaxCode(vatNote: any): string {
    return vatNote.tax.type.value;
  }

  private getTaxTreatment(vatNote: any): string {
    return vatNote.tax.treatment.value;
  }

  private getVatNote(
    vatNote: any,
    invoiceItems: InvoiceItem[],
    rate: number
  ): string {
    const { template } = vatNote;
    return template
      .replace(
        '{Vat/Rate}',
        `${(
          invoiceItems.reduce(
            (acc, curr) => acc + (curr.vat / 100) * curr.calculatePrice(),
            0
          ) / rate
        ).toFixed(2)}`
      )
      .replace('{Rate}', rate);
  }

  private async registerJournal(data: any) {
    const connection = await this.getConnection();
    const {
      fixedValues: { companyId }
    } = this;
    const { invoice, manuscript } = data;

    const existingTagsByInvoiceNumber = await connection
      .sobject('s2cor__Sage_ACC_Tag__c')
      .select({ Id: true })
      .where({ Name: invoice.referenceNumber, s2cor__Company__c: companyId })
      .execute();

    if (existingTagsByInvoiceNumber.length === 0) {
      return null;
    }

    const journalReference = `Hindawi APC Recognition for article ${manuscript.customId} ${invoice.referenceNumber}`;
    const journalData = {
      name: `Article ${manuscript.customId} - Invoice ${invoice.referenceNumber}`,
      s2cor__Reference__c: journalReference,
      s2cor__Approval_Status__c: 'Posted',
      s2cor__Date__c: manuscript.datePublished,
      s2cor__Create_Tags__c: false,
      s2cor__Company__c: 'a5T0Y000000TR3pUAG',
      s2cor__Default_Tax_Treatment__c: 'a6B0Y000000fyP2UAI',
      s2cor__Currency__c: 'a5W0Y000000GnlcUAC',
      s2cor__Journal_Type__c: 'a4n0Y000000HGqQQAW'
    };

    const existingJournal = await connection
      .sobject('s2cor__Sage_ACC_Journal__c')
      .select({ Id: true })
      .where({ Name: journalData.name })
      .execute();

    let journal: any;
    if (existingJournal.length) {
      journal = existingJournal[0];
      journal.id = journal.Id || journal.id;
      this.logger.info('Journal object reused', journal.id);
    } else {
      journal = await connection
        .sobject('s2cor__Sage_ACC_Journal__c')
        .create(journalData);
      if (!journal.success) {
        throw journal;
      }
      this.logger.info('Journal object registered: ', journal.id);
    }

    return journal;
  }

  private async registerJournalItem(data: any) {
    const connection = await this.getConnection();
    const { journal, manuscript, invoice, invoiceTotal } = data;

    const journalItemData = {
      Name: `Article ${manuscript.customId} - Invoice ${invoice.referenceNumber}`,
      s2cor__Journal__c: journal.id,
      s2cor__Reference__c: `Hindawi APC Recognition for article ${manuscript.customId} ${invoice.referenceNumber}`,
      s2cor__Journal_Type__c: 'a4n0Y000000HGqQQAW',
      s2cor__Amount__c: invoiceTotal,
      s2cor__Date__c: manuscript.datePublished,
      s2cor__Approval_Status__c: 'Posted',
      s2cor__Status__c: 'Submitted'
    };

    const existingJournalItem = await connection
      .sobject('s2cor__Sage_ACC_Journal_Item__c')
      .select({ Id: true })
      .where({ Name: journalItemData.Name })
      .execute();

    let journalItem: any;
    if (existingJournalItem.length) {
      journalItem = existingJournalItem[0];
      journalItem.id = journalItem.Id || journalItem.id;
      this.logger.info('Journal Item object reused: ', journalItem.id);
    } else {
      journalItem = await connection
        .sobject('s2cor__Sage_ACC_Journal_Item__c')
        .create(journalItemData);
      if (!journalItem.success) {
        throw journalItem;
      }
      this.logger.info('Journal Item object registered: ', journalItem.id);
    }

    return journalItem;
  }

  private async registerJournalTags(data: any) {
    const connection = await this.getConnection();
    const {
      fixedValues: { companyId }
    } = this;
    const { invoice, journal } = data;

    const journalTags = [];
    const dimensions = {
      RevenueRecognitionType: 'a4V0Y0000001chdUAA',
      SalesInvoiceNumber: 'a4V0Y0000001chSUAQ'
    };

    const existingJournalTags = await connection
      .sobject('s2cor__Sage_ACC_Tag__c')
      .select({ Id: true, Name: true })
      .where({ Name: invoice.referenceNumber, s2cor__Company__c: companyId })
      .execute();

    const journalTagData = {
      s2cor__Journal__c: journal.id,
      s2cor__Dimension__c: dimensions.RevenueRecognitionType,
      s2cor__Tag__c: 'a5L0Y000000g0EeUAI' // For Hindawi journals
    };

    let journalTag: any;
    journalTag = await connection
      .sobject('s2cor__Sage_ACC_Journal_Tag__c')
      .create(journalTagData);

    if (!journalTag.success) {
      throw journalTag;
    }
    this.logger.info(
      `Journal Tag for ${dimensions.RevenueRecognitionType} object registered`,
      journalTag.id
    );
    journalTags.push(journalTag);

    journalTagData.s2cor__Tag__c = (existingJournalTags[0] as any).Id;
    journalTagData.s2cor__Dimension__c = dimensions.SalesInvoiceNumber;
    journalTag = await connection
      .sobject('s2cor__Sage_ACC_Journal_Tag__c')
      .create(journalTagData);
    journalTags.push(journalTag);

    return journalTags;
  }

  private async registerJournalItemTag(data: any) {
    const connection = await this.getConnection();
    const { journalItem } = data;

    const journalItemTagData = {
      s2cor__Journal_Item__c: journalItem.id,
      s2cor__Tag__c: 'a5L0Y000000PFE7UAO' // For Hindawi journals
    };

    const existingJournalItemTag = await connection
      .sobject('s2cor__Sage_ACC_Journal_Item_Tag__c')
      .select({ Id: true })
      .where({ s2cor__Journal_Item__c: journalItem.id })
      .execute();

    let journalItemTag: any;
    if (existingJournalItemTag.length) {
      journalItemTag = existingJournalItemTag[0];
      journalItemTag.id = journalItemTag.Id || journalItemTag.id;
      this.logger.info('Journal Item Tag object reused: ', journalItemTag.id);
    } else {
      journalItemTag = await connection
        .sobject('s2cor__Sage_ACC_Journal_Item_Tag__c')
        .create(journalItemTagData);
      if (!journalItemTag.success) {
        throw journalItemTag;
      }
      this.logger.info(
        'Journal Item Tag object registered: ',
        journalItemTag.id
      );
    }

    return journalItemTag;
  }
}
