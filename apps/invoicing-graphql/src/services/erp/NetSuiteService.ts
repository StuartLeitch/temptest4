/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import axios, { AxiosRequestConfig } from 'axios';
import { format } from 'date-fns';
import knex from 'knex';

import {
  LoggerBuilderContract,
  ErpServiceContract,
  LoggerContract,
  PaymentMethod,
  InvoiceItem,
  Manuscript,
  CreditNote,
  Address,
  Invoice,
  Payment,
  Payer,
} from '@hindawi/shared';

import {
  RegisterPaymentResponse,
  RegisterPaymentRequest,
  ErpInvoiceResponse,
  ErpInvoiceRequest,
  ErpRevRecResponse,
  ErpRevRecRequest,
  ErpTaxDetails,
} from './../../../../../libs/shared/src/lib/domain/services/ErpService';

import { ConnectionConfig } from './netsuite/ConnectionConfig';
import { CustomerPayload } from './netsuite/typings';
import { Connection } from './netsuite/Connection';

export class NetSuiteService implements ErpServiceContract {
  private constructor(
    private connection: Connection,
    private logger: LoggerContract,
    private customSegmentFieldName: string,
    private customExternalPaymentReference: string,
    private customUniquePaymentReference: string,
    private taxDetailsUkStandard: ErpTaxDetails,
    private taxDetailsUkZero: ErpTaxDetails,
    readonly referenceMappings?: Record<string, any>
  ) {}

  get vendorName(): string {
    return 'netsuite';
  }

  public static create(
    config: Record<string, unknown>,
    loggerBuilder: LoggerBuilderContract,
    customSegmentFieldName: string,
    customExternalPaymentReference: string,
    customUniquePaymentReference: string,
    taxDetailsUkStandard: ErpTaxDetails,
    taxDetailsUkZero: ErpTaxDetails
  ): NetSuiteService {
    const { connection: configConnection, referenceMappings } = config;
    const connection = new Connection({
      config: new ConnectionConfig(configConnection),
    });

    const logger = loggerBuilder.getLogger();
    logger.setScope('NetSuiteService');

    const service = new NetSuiteService(
      connection,
      logger,
      customSegmentFieldName,
      customExternalPaymentReference,
      customUniquePaymentReference,
      taxDetailsUkStandard,
      taxDetailsUkZero,
      referenceMappings
    );

    return service;
  }

  public async registerInvoice(
    data: ErpInvoiceRequest
  ): Promise<ErpInvoiceResponse> {
    this.logger.info({
      message: 'New Erp request',
      request: data,
    });

    const customerId = await this.getCustomerId(data);

    const response = await this.createInvoice({
      customerId,
      customSegmentId: data.customSegmentId,
      invoice: data.invoice,
      itemId: data.itemId,
      items: data.items,
      journalName: data.journalName,
      manuscript: data.manuscript,
      billingAddress: data.billingAddress,
    });
    return {
      tradeDocumentId: String(response),
      tradeItemIds: null,
      accountId: null,
    };
  }

  public async registerRevenueRecognition(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse> {
    const {
      publisherCustomValues: {
        customSegmentId,
        creditAccountId,
        debitAccountId,
        creditAccountIdForCascaded
      },
    } = data;

    const revenueRecognition = await this.createRevenueRecognition({
      ...data,
      creditAccountId,
      customSegmentId,
      debitAccountId,
      creditAccountIdForCascaded,
    });

    return {
      journal: { id: String(revenueRecognition) },
      journalItem: null,
      journalTags: null,
      journalItemTag: null,
    };
  }

  public async registerRevenueRecognitionReversal(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse> {
    const {
      publisherCustomValues: {
        customSegmentId,
        creditAccountId,
        debitAccountId,
      },
    } = data;

    const revenueRecognitionReversal = await this.createRevenueRecognitionReversal(
      {
        ...data,
        creditAccountId,
        customSegmentId,
        debitAccountId,
      }
    );

    return {
      journal: { id: String(revenueRecognitionReversal) },
      journalItem: null,
      journalTags: null,
      journalItemTag: null,
    };
  }

  public async registerCreditNote(
    data: ErpInvoiceRequest
  ): Promise<ErpInvoiceResponse> {
    const creditNoteId = await this.transformCreditNote(data);

    // * Only patch newly created credit notes
    if (creditNoteId) {
      await this.patchCreditNote({ ...data, creditNoteId });
    }

    return creditNoteId;
  }

  public async registerPayment(
    data: RegisterPaymentRequest
  ): Promise<RegisterPaymentResponse> {
    const { payer, manuscript } = data;

    const customerAlreadyExists = await this.queryCustomer(
      this.getCustomerPayload(payer, manuscript)
    );

    if (!customerAlreadyExists) {
      const errorMessage = `Customer with name "${
        this.getCustomerPayload(payer, manuscript).companyName
      }" does not exists for article: ${manuscript.customId}.`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const paymentReference = await this.createPayment({
      ...data,
      customerId: customerAlreadyExists.id,
    });

    return { paymentReference };
  }

  private async getCustomerId(data: { payer: Payer; manuscript: Manuscript }) {
    const { payer, manuscript } = data;

    let customerId;

    const customerAlreadyExists = await this.queryCustomer(
      this.getCustomerPayload(payer, manuscript)
    );

    if (customerAlreadyExists) {
      this.logger.info({
        message: 'Reusing customer',
        payer,
        manuscript,
        customer: customerAlreadyExists,
      });
      customerId = customerAlreadyExists.id;
    } else {
      customerId = await this.createCustomer(data);
      this.logger.info({
        message: 'Newly created customer',
        customerId,
      });
    }

    return customerId;
  }

  private async queryCustomer(customer: CustomerPayload) {
    const {
      connection: { config, oauth, token },
    } = this;

    // * Query customers
    const queryCustomerRequestOpts = {
      url: `${config.endpoint}query/v1/suiteql`,
      method: 'POST',
    };

    const queryBuilder = knex({ client: 'pg' });
    let query = queryBuilder.raw(
      'select id, companyName, email, isPerson, dateCreated from customer'
    );
    if (customer.companyName) {
      query = queryBuilder.raw(`${query.toQuery()} where companyName = ?`, [
        customer.companyName,
      ]);
    }

    const queryCustomerRequest = {
      q: query.toQuery(),
    };

    this.logger.debug({
      message: 'Query builder for get customer',
      request: queryCustomerRequest,
    });

    try {
      const res = await axios({
        ...queryCustomerRequestOpts,
        headers: {
          prefer: 'transient',
          ...oauth.toHeader(oauth.authorize(queryCustomerRequestOpts, token)),
        },
        data: queryCustomerRequest,
      } as AxiosRequestConfig);

      return res?.data?.items?.pop();
    } catch (err) {
      this.logger.error(err?.request?.data);
      throw err;
    }
  }

  private async createCustomer(data: { payer: Payer; manuscript: Manuscript }) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { payer, manuscript } = data;

    let newCustomerId = null;

    // * Create Customer
    const createCustomerRequestOpts = {
      url: `${config.endpoint}record/v1/customer`,
      method: 'POST',
    };

    const createCustomerPayload = this.getCustomerPayload(payer, manuscript);

    this.logger.info({
      message: 'Creating customer netsuite',
      request: createCustomerPayload,
    });

    try {
      const res = await axios({
        ...createCustomerRequestOpts,
        headers: oauth.toHeader(
          oauth.authorize(createCustomerRequestOpts, token)
        ),
        data: createCustomerPayload,
      } as AxiosRequestConfig);

      newCustomerId = res?.headers?.location?.split('/').pop();
      return newCustomerId;
    } catch (err) {
      this.logger.error({
        message: 'Failed to create customer',
        response: err?.response?.data,
        request: createCustomerPayload,
      });
      return { err, isAuthError: true } as unknown;
    }
  }

  private async createInvoice(data: {
    invoice: Invoice;
    items: InvoiceItem[];
    manuscript: Manuscript;
    journalName: string;
    customSegmentId: string;
    itemId: string;
    customerId: string;
    billingAddress: Address;
  }) {
    const {
      connection: { config, oauth, token },
    } = this;
    const {
      invoice,
      items: [item],
      manuscript,
      journalName,
      customerId,
      customSegmentId,
      itemId,
      billingAddress,
    } = data;

    const invoiceRequestOpts = {
      url: `${config.endpoint}record/v1/invoice`,
      method: 'POST',
    };

    let taxDetails: ErpTaxDetails = null;

    if (billingAddress.country === 'GB' || billingAddress.country === 'UK') {
      taxDetails = this.taxDetailsUkStandard;
    } else {
      taxDetails = this.taxDetailsUkZero;
    }

    const createInvoicePayload: Record<string, any> = {
      tranDate: format(
        new Date(invoice.dateIssued),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      saleseffectivedate: format(
        new Date(invoice.dateAccepted),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T12:00:12.857Z',
      tranId: invoice.persistentReferenceNumber,
      entity: {
        id: customerId,
      },
      [this.customSegmentFieldName]: {
        id: customSegmentId,
      },
      item: {
        items: [
          {
            amount: item.calculateNetPrice(),
            description: `${journalName} - Article Processing Charges for ${manuscript.customId}`,
            quantity: 1.0,
            rate: item.price,
            excludeFromRateRequest: false,
            printItems: false,
            item: {
              id: itemId,
            },
          },
        ],
      },
      taxDetailsOverride: true,
      taxDetails: {
        items: [
          {
            taxDetailsReference: taxDetails.taxDetailsReference,
            taxCode: taxDetails.taxCode,
            taxType: taxDetails.taxType,
            taxBasis: item.calculateNetPrice(),
            taxAmount: item.calculateVat(),
            taxRate: item.vat,
          },
        ],
      },
    };

    try {
      const res = await axios({
        ...invoiceRequestOpts,
        headers: oauth.toHeader(oauth.authorize(invoiceRequestOpts, token)),
        data: createInvoicePayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      this.logger.error({
        message: 'Failed to create invoice',
        response: err?.response?.data,
        request: createInvoicePayload,
      });
      throw err;
    }
  }

  private async createPayment(data: {
    invoice: Invoice;
    payment: Payment;
    paymentMethods: PaymentMethod[];
    total: number;
    customerId?: string;
  }): Promise<string> {
    const {
      connection: { config, oauth, token },
    } = this;
    const { invoice, payment, paymentMethods, total, customerId } = data;

    const accountMap = {
      Paypal: '213',
      'Credit Card': '216',
      'Bank Transfer': '221',
    };

    const nsErpReference = invoice
      .getErpReferences()
      .getItems()
      .filter(
        (er) => er.vendor === 'netsuite' && er.attribute === 'confirmation'
      )
      .find(Boolean);

    if (nsErpReference?.value === 'NON_INVOICEABLE') {
      this.logger.warn({
        message: `Payment in NetSuite cancelled for "NON_INVOICEABLE" Invoice ${invoice.id.toString()}.`,
      });
      return;
    }

    const paymentRequestOpts = {
      url: `${config.endpoint}record/v1/customerpayment`,
      method: 'POST',
    };

    const [paymentAccount] = paymentMethods.filter((pm) =>
      pm.id.equals(payment.paymentMethodId.id)
    );

    let refName = `${invoice.id}/${payment.foreignPaymentId}`;

    const paymentAlreadyExists = await this.checkCustomerPaymentExists(refName);
    if (paymentAlreadyExists.alreadyExists) {
      return paymentAlreadyExists.id;
    }

    const createPaymentPayload = {
      autoApply: true,
      account: {
        id: accountMap[paymentAccount.name],
      },
      tranDate: format(
        new Date(payment.datePaid),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
      customer: {
        id: customerId,
      },
      // Invoice reference number,
      refName: `Invoice #${invoice.persistentReferenceNumber}`,
      [this
        .customExternalPaymentReference]: payment.foreignPaymentId.toString(),
      [this.customUniquePaymentReference]: refName,
      // Original amount,
      total,
      // Amount due,
      payment: payment.amount.value,
    };

    this.logger.info({
      createPaymentPayload,
    });

    try {
      const res = await axios({
        ...paymentRequestOpts,
        headers: oauth.toHeader(oauth.authorize(paymentRequestOpts, token)),
        data: createPaymentPayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      this.logger.error({
        message: 'Failed to create payment',
        response: err?.response?.data,
      });
      throw err;
    }
  }

  private async createRevenueRecognition(data: {
    invoice: Invoice;
    manuscript: Manuscript;
    invoiceTotal: number;
    creditAccountId: string;
    debitAccountId: string;
    customSegmentId: string;
    creditAccountIdForCascaded: string;
  }) {
    const {
      connection: { config, oauth, token },
    } = this;
    const {
      invoice,
      manuscript,
      invoiceTotal,
      creditAccountId,
      creditAccountIdForCascaded,
      debitAccountId,
      customSegmentId,
    } = data;

    const journalRequestOpts = {
      url: `${config.endpoint}record/v1/journalentry`,
      method: 'POST',
    };

    const createJournalPayload: Record<string, unknown> = {
      approved: true,
      tranId: `Article ${manuscript.customId} - Invoice ${invoice.persistentReferenceNumber}`,
      memo: `${invoice.persistentReferenceNumber}`,
      custbody_phenom_publish_date: format(
        new Date(manuscript.datePublished),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      [this.customSegmentFieldName]: {
        id: customSegmentId,
      },
      line: {
        items: [
          {
            memo: `${invoice.persistentReferenceNumber}`,
            account: {
              id: debitAccountId,
            },
            debit: invoiceTotal,
          },
          {
            memo: `${invoice.persistentReferenceNumber}`,
            account: {
              id: manuscript.is_cascaded ?  creditAccountIdForCascaded : creditAccountId,
            },
            credit: invoiceTotal,
          },
        ],
      },
    };

    try {
      const res = await axios({
        ...journalRequestOpts,
        headers: oauth.toHeader(oauth.authorize(journalRequestOpts, token)),
        data: createJournalPayload,
      } as AxiosRequestConfig);

      const journalId = res?.headers?.location?.split('/').pop();

      // // * check first if the invoice exists
      // await this.patchInvoice({ ...data, journalId });

      return journalId;
    } catch (err) {
      this.logger.error({
        message: 'Failed to create revenue recognition',
        response: err?.response?.data,
        request: createJournalPayload,
      });
      throw err;
    }
  }

  private async createRevenueRecognitionReversal(data: {
    invoice: Invoice;
    manuscript: Manuscript;
    invoiceTotal: number;
    creditAccountId: string;
    debitAccountId: string;
    customSegmentId: string;
    creditAccountIdForCascaded: string
  }) {
    const {
      connection: { config, oauth, token },
    } = this;
    const {
      invoice,
      manuscript,
      invoiceTotal,
      creditAccountId,
      debitAccountId,
      customSegmentId,
      creditAccountIdForCascaded
    } = data;

    const journalRequestOpts = {
      url: `${config.endpoint}record/v1/journalentry`,
      method: 'POST',
    };

    const { persistentReferenceNumber: referenceNumber } = invoice;

    const createJournalPayload: Record<string, unknown> = {
      approved: true,
      tranId: `Article ${manuscript.customId} - CN-${referenceNumber}`,
      memo: `${referenceNumber}`,
      custbody_phenom_publish_date: format(
        new Date(manuscript.datePublished),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
      [this.customSegmentFieldName]: {
        id: customSegmentId,
      },
      line: {
        items: [
          {
            memo: `${referenceNumber}`,
            account: {
              id: manuscript.is_cascaded ?  creditAccountIdForCascaded : creditAccountId,
            },
            debit: invoiceTotal,
          },
          {
            memo: `${referenceNumber}`,
            account: {
              id: debitAccountId,
            },
            credit: invoiceTotal,
          },
        ],
      },
    };

    try {
      const res = await axios({
        ...journalRequestOpts,
        headers: oauth.toHeader(oauth.authorize(journalRequestOpts, token)),
        data: createJournalPayload,
      } as AxiosRequestConfig);
      const journalId = res?.headers?.location?.split('/').pop();
      // await this.patchInvoice({ ...data, journalId });
      return journalId;
    } catch (err) {
      console.error(err);
      return { err } as unknown;
    }
  }

  private async transformCreditNote(data: {
    invoice?: Invoice;
    creditNote?: CreditNote;
  }) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { invoice, creditNote } = data;

    const originalNSErpReference = invoice
      .getErpReferences()
      .getItems()
      .filter(
        (er) => er.vendor === 'netsuite' && er.attribute === 'confirmation'
      )
      .find(Boolean);

    if (originalNSErpReference.value === 'NON_INVOICEABLE') {
      this.logger.warn({
        message: `CreditNote in NetSuite cancelled for "NON_INVOICEABLE" Invoice ${invoice.id.toString()}.`,
      });
      return;
    }

    const creditNoteTransformOpts = {
      url: `${config.endpoint}record/v1/invoice/${originalNSErpReference.value}/!transform/creditmemo`,
      method: 'POST',
    };

    const creditNotePayload: Record<string, any> = {
      tranDate: format(
        new Date(creditNote.dateIssued),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      saleseffectivedate: format(
        new Date(invoice.dateAccepted),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
    };

    try {
      const res = await axios({
        ...creditNoteTransformOpts,
        headers: oauth.toHeader(
          oauth.authorize(creditNoteTransformOpts, token)
        ),
        data: creditNotePayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      this.logger.error({
        message: 'Failed to create credit note',
        response: err?.response?.data,
        requestOptions: creditNoteTransformOpts,
      });
      throw err;
    }
  }

  private async patchCreditNote(data: {
    creditNote?: CreditNote;
    creditNoteId?: string;
    invoice?: Invoice;
  }) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { creditNote, invoice, creditNoteId } = data;

    const creditNoteRequestOpts = {
      url: `${config.endpoint}record/v1/creditmemo/${creditNoteId}`,
      method: 'PATCH',
    };

    let memo = 'Other';
    switch (creditNote.creationReason) {
      case 'withdrawn-manuscript':
        memo = 'Withdrawn Manuscript';
        break;
      case 'reduction-applied':
        memo = 'Reduction Applied';
        break;
      case 'waived-manuscript':
        memo = 'Waived Manuscript';
        break;
      case 'change-payer-details':
        memo = 'Change Payer Details';
        break;
      case 'bad-debt':
        memo = 'Bad Debt';
        break;
    }

    const patchCreditNotePayload: Record<string, any> = {
      tranId: `CN-${invoice.persistentReferenceNumber}`,
      tranDate: format(
        new Date(creditNote.dateIssued),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      saleseffectivedate: format(
        new Date(invoice.dateAccepted),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
      memo,
    };

    try {
      const res = await axios({
        ...creditNoteRequestOpts,
        headers: oauth.toHeader(oauth.authorize(creditNoteRequestOpts, token)),
        data: patchCreditNotePayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      this.logger.error({
        message: 'Failed to update credit note',
        response: err?.response?.data,
        request: patchCreditNotePayload,
      });
      throw err;
    }
  }

  private getCustomerPayload(
    payer: Payer,
    manuscript: Manuscript
  ): CustomerPayload {
    const MAX_LENGTH = 32;
    const createCustomerPayload: CustomerPayload = {
      email: payer?.email.toString(),
      isPerson: false,
      companyName: '',
      vatRegNumber: '',
    };

    const keep = ` ${manuscript.customId.toString()}`;

    let [firstName, ...lastNames] = payer?.name.toString().split(' ');

    lastNames = lastNames.map((n) => n.trim()).filter((n) => n?.length !== 0);

    let sendingName = '';

    if (payer.type === 'INSTITUTION') {
      sendingName = payer?.organization.toString();
    } else {
      sendingName = firstName.concat(' ', lastNames.join(' '));
    }

    const cpy = sendingName;
    sendingName = sendingName + keep;

    if (sendingName?.length > MAX_LENGTH) {
      sendingName = cpy?.slice(0, MAX_LENGTH - keep.length).trim() + keep;
    }

    createCustomerPayload.companyName = sendingName;
    createCustomerPayload.vatRegNumber = payer.VATId?.slice(0, 20);

    return createCustomerPayload;
  }

  public async checkInvoiceExists(
    invoiceErpReference: string
  ): Promise<boolean> {
    const {
      connection: { config, oauth, token },
    } = this;

    let invoiceExistsRequestOpts = {
      url: `${config.endpoint}record/v1/invoice/${invoiceErpReference}`,
      method: 'GET',
    };
    try {
      const headers = oauth.toHeader(
        oauth.authorize(invoiceExistsRequestOpts, token)
      );
      const checker = await axios({
        ...invoiceExistsRequestOpts,
        headers,
        data: {},
      } as AxiosRequestConfig);

      const invoiceExists = checker?.data?.links?.length > 0;
      this.logger.debug(
        `Credit Note sanity check if invoice exists result is ${invoiceExists}`
      );
      return invoiceExists;
    } catch (err) {
      this.logger.error({
        message: `Error checking if invoice is already registered in NetSuite.`,
        response: err?.response?.data['o:errorDetails'],
        error: err,
      });
    }
  }

  public async checkCustomerPaymentExists(refName: string): Promise<any> {
    const {
      connection: { config, oauth, token },
      customUniquePaymentReference,
    } = this;

    let recordExistsRequestOpts = {
      url: `${config.endpoint}query/v1/suiteql`,
      method: 'POST',
    };

    // * Query customer payments
    const queryBuilder = knex({ client: 'pg' });
    let query = queryBuilder.raw(
      "SELECT * FROM transaction WHERE recordtype = 'customerpayment'"
    );
    if (refName) {
      query = queryBuilder.raw(
        `${query.toQuery()} AND ${customUniquePaymentReference} = ?`,
        refName
      );
    }

    this.logger.debug({
      message: 'Query builder for checking against payments',
      request: query.toQuery(),
    });

    try {
      const checker = await axios({
        ...recordExistsRequestOpts,
        headers: {
          prefer: 'transient',
          ...oauth.toHeader(oauth.authorize(recordExistsRequestOpts, token)),
        },
        data: { q: query.toQuery() },
      } as AxiosRequestConfig);

      if (checker?.data.count > 0) {
        return {
          alreadyExists: true,
          id: checker.data.items[0].id,
        };
      } else {
        return {
          alreadyExists: false,
        };
      }
    } catch (err) {
      this.logger.warn({
        message: `Error checking if customer payment is already registered in NetSuite.`,
        response: err?.response?.data['o:errorDetails'],
      });
    }
  }

  public async getExistingRevenueRecognition(
    invoiceRefNumber: string,
    manuscriptCustomId: string
  ): Promise<{ count: number; id?: string }> {
    const {
      connection: { config, oauth, token },
    } = this;

    // Query revenue recognition transactions
    const revenueRecognitionRequestOpts = {
      url: `${config.endpoint}query/v1/suiteql`,
      method: 'POST',
    };

    const queryBuilder = knex({ client: 'pg' });
    let query = queryBuilder.raw(
      `SELECT * FROM transaction WHERE recordtype = 'journalentry' AND tranid = 'Article ${manuscriptCustomId} - Invoice ${invoiceRefNumber}'`
    );

    const revenueRecognitionRequest = {
      q: query.toQuery(),
    };
    this.logger.debug({
      message: 'Query builder for get revenue recognition',
      request: revenueRecognitionRequest,
    });

    try {
      const res = await axios({
        ...revenueRecognitionRequestOpts,
        headers: {
          prefer: 'transient',
          ...oauth.toHeader(
            oauth.authorize(revenueRecognitionRequestOpts, token)
          ),
        },
        data: revenueRecognitionRequest,
      } as AxiosRequestConfig);
      if (res.data.count === 0) {
        return { count: res.data.count };
      } else {
        return { count: res.data.count, id: res.data.items[0].id };
      }
    } catch (err) {
      this.logger.error({
        message: 'No Revenue Recognition found.',
        response: err?.response?.data,
      });
      throw new Error(err);
    }
  }
}
