/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  ErpServiceContract,
  ErpData,
  ErpResponse,
} from './../../../../../libs/shared/src/lib/domain/services/ErpService';

import { Connection } from './netsuite/Connection';
import { ConnectionConfig } from './netsuite/ConnectionConfig';

export class NetSuiteService {
  private constructor(private connection: Connection) {}

  public static create(config: any): any {
    const connection = new Connection({
      config: new ConnectionConfig(config.connection),
    });
    const service = new NetSuiteService(connection);

    return service;
  }

  public async registerInvoice(data: ErpData): Promise<ErpResponse> {
    const {
      connection: { config, oauth, token },
    } = this;

    const requestOpts = {
      url: `${config.endpoint}record/v1/invoice`,
      method: 'POST',
    };

    const res = await axios({
      ...requestOpts,
      headers: oauth.toHeader(oauth.authorize(requestOpts, token)),
      data: {
        companyName: 'Hindawi Corporation',
        email: 'donald.trump@hindawi.com',
      },
    } as AxiosRequestConfig);

    console.info(res.data);

    return null;
  }

  public async registerRevenueRecognition(data: ErpData): Promise<ErpResponse> {
    // ? Do nothing yet
    return null;
  }
}
