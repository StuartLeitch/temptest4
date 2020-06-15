/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  ErpServiceContract,
  ErpData,
  ErpResponse,
} from './../../../../../libs/shared/src/lib/domain/services/ErpService';

import { Connection } from './netsuite/Connection';
import { ConnectionConfig } from './netsuite/ConnectionConfig';

export class NetSuiteService implements ErpServiceContract {
  public static create(config: any): Connection {
    return new Connection({ config: new ConnectionConfig(config.connection) });
  }

  public registerInvoice(data: ErpData): Promise<ErpResponse> {
    return null;
  }

  public registerRevenueRecognition(data: ErpData): Promise<ErpResponse> {
    return null;
  }
}
