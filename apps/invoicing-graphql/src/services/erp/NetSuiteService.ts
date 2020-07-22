/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { format } from 'date-fns';

import {
  // ErpServiceContract,
  ErpData,
  ErpResponse,
} from './../../../../../libs/shared/src/lib/domain/services/ErpService';

import { Connection } from './netsuite/Connection';
import { ConnectionConfig } from './netsuite/ConnectionConfig';

export class NetSuiteService {
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

    let customerId;
    const customerAlreadyExists = await this.queryCustomer(data);

    if (customerAlreadyExists) {
      customerId = customerAlreadyExists.id;
    } else {
      customerId = await this.createCustomer(data);
    }

    return this.createInvoice({ ...data, customerId });
  }

  public async registerRevenueRecognition(data: ErpData): Promise<ErpResponse> {
    console.log('registerRevenueRecognition Data:');
    console.info(data);

    const debitAccountId = '1'; // this.queryAccount(data);
    const creditAccountId = '213'; // this.queryAccount(data);

    const revenueRecognition = await this.createRevenueRecognition({
      ...data,
      creditAccountId,
      debitAccountId,
    });

    return revenueRecognition;
  }

  public async registerCreditNote(data: ErpData): Promise<ErpResponse> {
    console.log('registerCreditNote Data:');
    console.info(data);

    return null;
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
      q: `SELECT id, companyName, email, dateCreated FROM customer WHERE email = '${payer?.email?.toString()}'`,
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
    const { payer } = data;

    let newCustomerId = null;

    // * Create Customer
    const createCustomerRequestOpts = {
      url: `${config.endpoint}record/v1/customer`,
      method: 'POST',
    };

    const createCustomerPayload: Record<string, unknown> = {
      email: payer?.email.toString(),
    };

    if (data?.payer?.type !== 'INSTITUTION') {
      createCustomerPayload.isPerson = true;
      const [firstName, ...lastNames] = payer?.name.split(' ');
      createCustomerPayload.firstName = firstName;
      createCustomerPayload.lastName = lastNames.join(' ');
    } else {
      createCustomerPayload.isPerson = false;
      createCustomerPayload.companyName = payer?.name.toString();
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
      rate,
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
      tranId: `${invoice.invoiceNumber}/${format(new Date(), 'yyyy')}`,
      entity: {
        id: customerId,
      },
      cseg1: {
        id: customSegmentId,
      },
      item: {
        items: [
          {
            amount: item.price,
            description: `${article.title} - Article Processing Charges for ${
              article.customId
            }/${format(new Date(), 'yyyy')}`,
            quantity: 1.0,
            rate,
            taxRate1: item.rate,
            excludeFromRateRequest: false,
            printItems: false,
            item: {
              id: itemId,
            },
            taxCode: {
              taxRateId,
            },
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
    const {
      connection: { config, oauth, token },
    } = this;
    const { invoiceTotal, creditAccountId, debitAccountId } = data;

    const journalRequestOpts = {
      url: `${config.endpoint}record/v1/journalentry`,
      method: 'POST',
    };

    const createJournalPayload: Record<string, unknown> = {
      approved: true,
      createdDate: format(
        new Date(data.invoice.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      line: {
        items: [
          {
            account: {
              id: debitAccountId,
            },
            debit: invoiceTotal,
          },
          {
            account: {
              id: creditAccountId,
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
      return journalId;
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }
}
