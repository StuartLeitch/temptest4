import axios, {
  AxiosRequestConfig /*, AxiosError, AxiosResponse*/,
} from 'axios';

import { Connection } from './Connection';
import { ConnectionConfig } from './ConnectionConfig';

export class NetSuiteHttpApi {
  private constructor(private connection: Connection) {}

  public static create(config: Record<string, unknown>): NetSuiteHttpApi {
    const connection = new Connection({
      config: new ConnectionConfig(config.connection),
    });
    return new NetSuiteHttpApi(connection);
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
}
