/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { format } from 'date-fns';

import { ErpServiceContract, PayerType } from '@hindawi/shared';

import {
  // ErpServiceContract,
  ErpData,
  ErpResponse,
} from './../../../../../libs/shared/src/lib/domain/services/ErpService';

import { Connection } from './netsuite/Connection';
import { ConnectionConfig } from './netsuite/ConnectionConfig';

export class NetSuiteService implements ErpServiceContract {
  private constructor(private connection: Connection) {}

  public static create(config: Record<string, unknown>): NetSuiteService {
    const connection = new Connection({
      config: new ConnectionConfig(config.connection),
    });
    const service = new NetSuiteService(connection);

    return service;
  }

  public async registerInvoice(data: ErpData): Promise<ErpResponse> {
    // console.log('ERP Data:');
    // console.info(data);

    const customerId = await this.getCustomerId(data);

    return this.createInvoice({ ...data, customerId });
  }

  public async registerRevenueRecognition(data: ErpData): Promise<ErpResponse> {
    console.log('registerRevenueRecognition Data:');
    console.info(data);

    const { customSegmentId } = data;
    const customerId = await this.getCustomerId(data);

    /**
     * * Hindawi will be accounts: debit id "376", credit id: "401"
     * * Partnerships will be accounts: debit id "377", credit id: "402"
     **/
    const idMap = {
      Hindawi: {
        debit: 376,
        credit: 401,
      },
      Partnership: {
        debit: 377,
        credit: 402,
      },
    };

    let creditAccountId;
    let debitAccountId;
    if (customSegmentId !== '0') {
      creditAccountId = idMap.Partnership.credit;
      debitAccountId = idMap.Partnership.debit;
    } else {
      creditAccountId = idMap.Hindawi.credit;
      debitAccountId = idMap.Hindawi.debit;
    }

    const revenueRecognition = await this.createRevenueRecognition({
      ...data,
      customerId,
      creditAccountId,
      debitAccountId,
    });

    return revenueRecognition;
  }

  public async registerCreditNote(data: ErpData): Promise<ErpResponse> {
    console.log('registerCreditNote Data:');
    console.info(data);

    const creditNoteId = await this.transformCreditNote(data);
    console.info(creditNoteId);
    await this.patchCreditNote({ ...data, creditNoteId });

    return creditNoteId;
  }

  public async registerPayment(data: ErpData): Promise<ErpResponse> {
    console.log('registerPayment Data:');
    console.info(data);

    const paymentId = await this.createPayment(data);
    console.info(paymentId);

    return paymentId;
  }

  private async getCustomerId(data: ErpData) {
    const { payer } = data;

    let customerId;
    const customerAlreadyExists = await this.queryCustomer(data);

    if (customerAlreadyExists) {
      if (
        (customerAlreadyExists.isperson === 'T' &&
          payer.type === PayerType.INSTITUTION) ||
        (customerAlreadyExists.isperson === 'F' &&
          payer.type !== PayerType.INSTITUTION)
      ) {
        customerId = await this.createCustomer(data);
      } else {
        customerId = customerAlreadyExists.id;
      }
    } else {
      customerId = await this.createCustomer(data);
    }

    return customerId;
  }

  private async queryCustomer(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { payer } = data;

    // * Query customers
    const queryCustomerRequestOpts = {
      url: `${config.endpoint}query/v1/suiteql`,
      method: 'POST',
    };

    const queryCustomerRequest = {
      q: `SELECT id, companyName, email, isPerson, dateCreated FROM customer WHERE email = '${payer?.email?.toString()}'`,
    };

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
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async createCustomer(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { payer, article } = data;

    let newCustomerId = null;

    // * Create Customer
    const createCustomerRequestOpts = {
      url: `${config.endpoint}record/v1/customer`,
      method: 'POST',
    };

    const createCustomerPayload: Record<string, unknown> = {
      email: payer?.email.toString(),
    };

    if (payer?.type !== PayerType.INSTITUTION) {
      createCustomerPayload.isPerson = true;
      const [firstName, ...lastNames] = payer?.name.toString().split(' ');
      createCustomerPayload.firstName = firstName;
      createCustomerPayload.lastName = `${lastNames.join(
        ' '
      )} - ${article.customId.toString()}`;
    } else {
      createCustomerPayload.isPerson = false;
      createCustomerPayload.companyName = `${
        payer?.organization.toString() || payer?.name.toString()
      } - ${article.customId.toString()}`;
      createCustomerPayload.vatRegNumber = payer.VATId;
    }

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
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err, isAuthError: true } as unknown;
    }
  }

  private async createInvoice(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const {
      invoice,
      // payer,
      items: [item],
      article,
      // billingAddress,
      // journalName,
      // vatNote,
      // rate,
      // tradeDocumentItemProduct,
      customerId,
      customSegmentId,
      itemId,
      taxRateId,
    } = data;
    // console.info(item);
    // console.info(invoice);

    const invoiceRequestOpts = {
      url: `${config.endpoint}record/v1/invoice`,
      method: 'POST',
    };

    const createInvoicePayload: Record<string, any> = {
      createdDate: format(
        new Date(invoice.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      saleseffectivedate: format(
        new Date(invoice.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T12:00:12.857Z',
      tranId: `${invoice.invoiceNumber}/${format(
        new Date(invoice.dateCreated),
        'yyyy'
      )}`,
      entity: {
        id: customerId,
      },
      item: {
        items: [
          {
            amount: item.price,
            description: `${article.title} - Article Processing Charges for ${
              article.customId
            }/${format(new Date(), 'yyyy')}`,
            quantity: 1.0,
            rate: item.price,
            taxRate1: item.rate,
            excludeFromRateRequest: false,
            printItems: false,
            item: {
              id: itemId,
            },
            taxCode: {
              id: taxRateId,
            },
          },
        ],
      },
    };

    if (customSegmentId !== '0') {
      createInvoicePayload.cseg1 = {
        id: customSegmentId,
      };
    }

    try {
      const res = await axios({
        ...invoiceRequestOpts,
        headers: oauth.toHeader(oauth.authorize(invoiceRequestOpts, token)),
        data: createInvoicePayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async createPayment(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { payment } = data;

    const paymentRequestOpts = {
      url: `${config.endpoint}record/v1/payment`,
      method: 'POST',
    };

    const createPaymentPayload: Record<string, any> = {
      createdDate: format(
        new Date(payment.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      saleseffectivedate: format(
        new Date(payment.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T12:00:12.857Z',
      tranId: `${payment.invoiceNumber}/${format(
        new Date(payment.dateCreated),
        'yyyy'
      )}`,
      // entity: {
      //   id: customerId,
      // },
      // item: {
      //   items: [
      //     {
      //       amount: item.price,
      //       description: `${article.title} - Article Processing Charges for ${
      //         article.customId
      //       }/${format(new Date(), 'yyyy')}`,
      //       quantity: 1.0,
      //       rate: item.price,
      //       taxRate1: item.rate,
      //       excludeFromRateRequest: false,
      //       printItems: false,
      //       item: {
      //         id: itemId,
      //       },
      //       taxCode: {
      //         id: taxRateId,
      //       },
      //     },
      //   ],
      // },
    };

    // if (customSegmentId !== '0') {
    //   createInvoicePayload.cseg1 = {
    //     id: customSegmentId,
    //   };
    // }

    try {
      const res = await axios({
        ...paymentRequestOpts,
        headers: oauth.toHeader(oauth.authorize(paymentRequestOpts, token)),
        data: createPaymentPayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async queryAccount(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { payer } = data;

    // * Query customers
    const queryAccountRequestOpts = {
      url: `${config.endpoint}query/v1/suiteql`,
      method: 'POST',
    };

    const queryAccountRequest = {
      q: `SELECT id, companyName, email, dateCreated FROM account WHERE email = '${payer?.email?.toString()}'`,
    };

    try {
      const res = await axios({
        ...queryAccountRequestOpts,
        headers: oauth.toHeader(
          oauth.authorize(queryAccountRequestOpts, token)
        ),
        data: queryAccountRequest,
      } as AxiosRequestConfig);

      return res?.data?.items?.pop();
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async createRevenueRecognition(data: any) {
    console.log('createRevenueRecognition Data:');
    console.info(data);

    const {
      connection: { config, oauth, token },
    } = this;
    const {
      invoice,
      // manuscript,
      invoiceTotal,
      creditAccountId,
      debitAccountId,
      customerId,
      customSegmentId,
    } = data;

    const journalRequestOpts = {
      url: `${config.endpoint}record/v1/journalentry`,
      method: 'POST',
    };

    const createJournalPayload: Record<string, unknown> = {
      approved: true,
      tranId: `Revenue Recognition - ${invoice.referenceNumber}`,
      memo: `${invoice.referenceNumber}`,
      entity: {
        id: customerId,
      },
      createdDate: format(
        new Date(data.invoice.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
      line: {
        items: [
          {
            memo: `${invoice.referenceNumber}`,
            account: {
              id: debitAccountId,
            },
            debit: invoiceTotal,
          },
          {
            memo: `${invoice.referenceNumber}`,
            account: {
              id: creditAccountId,
            },
            credit: invoiceTotal,
          },
        ],
      },
    };

    if (customSegmentId !== '0') {
      createJournalPayload.cseg1 = {
        id: customSegmentId,
      };
    }

    console.log('createJournalPayload:');
    console.info(createJournalPayload);

    try {
      const res = await axios({
        ...journalRequestOpts,
        headers: oauth.toHeader(oauth.authorize(journalRequestOpts, token)),
        data: createJournalPayload,
      } as AxiosRequestConfig);

      const journalId = res?.headers?.location?.split('/').pop();
      await this.patchInvoice({ ...data, journalId });
      return journalId;
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async patchInvoice(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { invoice, journalId } = data;

    // console.log('patchInvoice data:');
    // console.info(journalId);
    // console.info(invoice);

    const invoiceRequestOpts = {
      url: `${config.endpoint}record/v1/invoice/${invoice.nsReference}`,
      method: 'PATCH',
    };

    const patchInvoicePayload: Record<string, unknown> = {
      custbody_bbs_revenue_journal: {
        id: journalId,
        refName: `Journal #${journalId}`,
      },
    };

    try {
      await axios({
        ...invoiceRequestOpts,
        headers: oauth.toHeader(oauth.authorize(invoiceRequestOpts, token)),
        data: patchInvoicePayload,
      } as AxiosRequestConfig);

      // const journalId = res?.headers?.location?.split('/').pop();
      // return journalId;
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async transformCreditNote(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { creditNote } = data;

    console.log('transformCreditNote data:');
    console.info(creditNote);

    const creditNoteTransformOpts = {
      url: `${config.endpoint}record/v1/invoice/${creditNote.nsReference}/!transform/creditmemo`,
      method: 'POST',
    };

    try {
      const res = await axios({
        ...creditNoteTransformOpts,
        headers: oauth.toHeader(
          oauth.authorize(creditNoteTransformOpts, token)
        ),
        data: {},
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  private async patchCreditNote(data: any) {
    const {
      connection: { config, oauth, token },
    } = this;
    const { creditNote, creditNoteId } = data;

    const creditNoteRequestOpts = {
      url: `${config.endpoint}record/v1/creditmemo/${creditNoteId}`,
      method: 'PATCH',
    };

    const patchCreditNotePayload: Record<string, any> = {
      // createdDate: format(
      //   new Date(invoice.dateCreated),
      //   "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      // ), // '2020-07-01T14:09:00Z',
      // saleseffectivedate: format(
      //   new Date(invoice.dateCreated),
      //   "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      // ), // '2020-07-01T12:00:12.857Z',
      tranId: `CN-${creditNote.invoiceNumber}/${format(
        new Date(creditNote.dateCreated),
        'yyyy'
      )}`,

      // entity: {
      //   id: customerId,
      // },
      // item: {
      //   items: [
      //     {
      //       amount: item.price,
      //       description: `${article.title} - Article Processing Charges for ${
      //         article.customId
      //       }/${format(new Date(), 'yyyy')}`,
      //       quantity: 1.0,
      //       rate: item.price,
      //       taxRate1: item.rate,
      //       excludeFromRateRequest: false,
      //       printItems: false,
      //       item: {
      //         id: itemId,
      //       },
      //       taxCode: {
      //         id: taxRateId,
      //       },
      //     },
      //   ],
      // },
    };

    // if (customSegmentId !== '0') {
    //   createInvoicePayload.cseg1 = {
    //     id: customSegmentId,
    //   };
    // }

    try {
      const res = await axios({
        ...creditNoteRequestOpts,
        headers: oauth.toHeader(oauth.authorize(creditNoteRequestOpts, token)),
        data: patchCreditNotePayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }
}
