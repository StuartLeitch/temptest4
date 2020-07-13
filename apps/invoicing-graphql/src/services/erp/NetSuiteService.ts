/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import format from 'date-fns/esm/format';

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

    const invoiceId = await this.createInvoice({ ...data, customerId });

    return invoiceId;
  }

  public async registerRevenueRecognition(data: ErpData): Promise<ErpResponse> {
    // ? Do nothing yet
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
        headers: oauth.toHeader(
          oauth.authorize(queryCustomerRequestOpts, token)
        ),
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
      createCustomerPayload.firstName = payer?.name.toString();
      createCustomerPayload.lastName = payer?.name.toString();
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

    const invoiceRequestOpts = {
      url: `${config.endpoint}record/v1/invoice`,
      method: 'POST',
    };

    const createInvoicePayload: Record<string, unknown> = {
      createdDate: format(
        new Date(data.invoice.dateCreated),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T14:09:00Z',
      saleseffectivedate: format(
        new Date(data.invoice.dateMovedToFinal),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ), // '2020-07-01T12:00:12.857Z',
      tranId: `${data.invoice.invoiceNumber}/${format(new Date(), 'YYYY')}`,
      entity: {
        id: data.customerId,
      },
      cseg1: {
        id: '2',
      },
      item: {
        items: [
          {
            amount: 666,
            description: `${data.article.title} - Article Processing Charges for 99901/2020`,
            quantity: 1.0,
            rate: 0.5,
            taxRate1: 20.0,
            excludeFromRateRequest: false,
            printItems: false,
            item: {
              id: '23',
            },
            taxCode: {
              id: '7',
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

      const invoiceId = res?.headers?.location?.split('/').pop();
      return invoiceId;
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }
}
