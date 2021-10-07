import axios, {
  AxiosRequestConfig /*, AxiosError, AxiosResponse*/,
} from 'axios';

import { Connection } from './Connection';
import { ConnectionConfig } from './ConnectionConfig';

type Payload = Record<string, unknown>;

export class NetSuiteHttpApi {
  private constructor(private connection: Connection) {}

  public static create(config: Record<string, unknown>): NetSuiteHttpApi {
    const connection = new Connection({
      config: new ConnectionConfig(config.connection),
    });
    return new NetSuiteHttpApi(connection);
  }

  public async queryCustomerRequest(queryCustomerPayload: {
    q: string;
  }): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    // * Query customers
    const queryCustomerRequestOpts = {
      url: `${config.endpoint}query/v1/suiteql`,
      method: 'POST',
    };

    try {
      const res = await axios({
        ...queryCustomerRequestOpts,
        headers: {
          prefer: 'transient',
          ...oauth.toHeader(oauth.authorize(queryCustomerRequestOpts, token)),
        },
        data: queryCustomerPayload,
      } as AxiosRequestConfig);

      return res?.data?.items?.pop();
    } catch (err) {
      // throw new Error('Unable to establish a login session.');
      console.error(err);
      // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  public async createCustomerRequest(createCustomerPayload: any): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    // * Create Customer
    const createCustomerRequestOpts = {
      url: `${config.endpoint}record/v1/customer`,
      method: 'POST',
    };

    try {
      const res = await axios({
        ...createCustomerRequestOpts,
        headers: oauth.toHeader(
          oauth.authorize(createCustomerRequestOpts, token)
        ),
        data: createCustomerPayload,
      } as AxiosRequestConfig);

      return res?.headers?.location?.split('/').pop();
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err, isAuthError: true } as unknown;
    }
  }

  public async createInvoiceRequest(createInvoicePayload: any): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    const invoiceRequestOpts = {
      url: `${config.endpoint}record/v1/invoice`,
      method: 'POST',
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

  public async createPaymentRequest(
    invoice,
    createPaymentPayload
  ): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    const paymentRequestOpts = {
      url: `${config.endpoint}record/v1/invoice/${invoice.nsReference}/!transform/customerpayment`,
      method: 'POST',
    };

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

  public async createRevenueRecognitionRequest(
    invoice,
    createJournalPayload
  ): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    const journalRequestOpts = {
      url: `${config.endpoint}record/v1/journalentry`,
      method: 'POST',
    };
    try {
      const res = await axios({
        ...journalRequestOpts,
        headers: oauth.toHeader(oauth.authorize(journalRequestOpts, token)),
        data: createJournalPayload,
      } as AxiosRequestConfig);

      const journalId = res?.headers?.location?.split('/').pop();
      const patchInvoicePayload: Record<string, unknown> = {
        custbody_bbs_revenue_journal: {
          id: journalId,
          refName: `Journal #${journalId}`,
        },
      };

      await this.patchInvoiceRequest(invoice, patchInvoicePayload);
      return journalId;
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  public async patchInvoiceRequest(
    invoice: any,
    patchInvoicePayload: any
  ): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    const invoiceRequestOpts = {
      url: `${config.endpoint}record/v1/invoice/${invoice.nsReference}`,
      method: 'PATCH',
    };
    try {
      await axios({
        ...invoiceRequestOpts,
        headers: oauth.toHeader(oauth.authorize(invoiceRequestOpts, token)),
        data: patchInvoicePayload,
      } as AxiosRequestConfig);
    } catch (err) {
      console.error(err);
      // throw new Error('Unable to establish a login session.'); // here I'd like to send the error to the user instead
      return { err } as unknown;
    }
  }

  public async patchCreditNoteRequest(
    creditNoteId: any,
    patchCreditNotePayload: any
  ): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    const creditNoteRequestOpts = {
      url: `${config.endpoint}record/v1/creditmemo/${creditNoteId}`,
      method: 'PATCH',
    };
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

  public async transformCreditNoteRequest(originalInvoice: any): Promise<any> {
    const {
      connection: { config, oauth, token },
    } = this;

    const creditNoteTransformOpts = {
      url: `${config.endpoint}record/v1/invoice/${originalInvoice.nsReference}/!transform/creditmemo`,
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
}
