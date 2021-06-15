import { createClient } from 'soap';
import EuroVat from 'eu-vat';

import { PoliciesRegister } from '../../modules/invoices/domain/policies/PoliciesRegister';
import { UKVATTreatmentArticleProcessingChargesPolicy } from './../../modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';
import { USVATPolicy } from './../../modules/invoices/domain/policies/USVATPolicy';
import { Address as VATAddress } from '../../modules/invoices/domain/policies/Address';

function getEndpoint() {
  return process.env.VAT_VALIDATION_SERVICE_ENDPOINT;
}

const INVALID_INPUT = 'soap:Server: INVALID_INPUT';
const MS_UNAVAILABLE = 'soap:Server: MS_UNAVAILABLE';

const vat = new EuroVat();
const policiesRegister = new PoliciesRegister();

let VATPolicy: USVATPolicy | UKVATTreatmentArticleProcessingChargesPolicy;

export interface CheckVatResponse {
  countryCode: string;
  vatNumber: string;
  requestDate: Date;
  valid: boolean;
  name: string;
  address: string;
}

// !!! Ugly as fuck!
// TODO: Please reconsider this solution
if (process.env.TENANT_COUNTRY === 'US') {
  VATPolicy = new USVATPolicy();
} else {
  VATPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
}
policiesRegister.registerPolicy(VATPolicy);

export class VATService {
  private async createClient() {
    return new Promise((resolve, reject) => {
      createClient(getEndpoint(), (err, client) => {
        if (err) {
          reject(err);
        }

        resolve(client);
      });
    });
  }

  private async checkVat(client: any, params: any) {
    return new Promise((resolve, reject) => {
      client.checkVat(params, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  public async checkVAT({
    countryCode,
    vatNumber,
  }: {
    countryCode: string;
    vatNumber: string;
  }): Promise<CheckVatResponse | Error> {
    let client: any;
    let result: any;

    try {
      client = await this.createClient();
    } catch (err) {
      // do nothing yet
    }

    try {
      result = await this.checkVat(client, { countryCode, vatNumber });
    } catch (err) {
      let error: Error;
      switch (err.message) {
        case INVALID_INPUT:
          error = new Error('INVALID_INPUT');
          break;
        case MS_UNAVAILABLE:
          error = new Error('MS_UNAVAILABLE');
          break;
      }

      return error;
    }

    return result;
  }

  public async getRates(countryCode?: string) {
    const rates = await vat.getRates(countryCode);
    return rates;
  }

  public calculateVAT(
    address: VATAddress,
    individualConfirmed: boolean,
    issueDate: Date
  ) {
    const calculateVAT = policiesRegister.applyPolicy(VATPolicy.getType(), [
      address,
      !individualConfirmed,
      individualConfirmed ? false : true,
      issueDate,
    ]);

    const VAT = calculateVAT.getVAT();
    return VAT;
  }

  public getVATNote(
    address: VATAddress,
    individualConfirmed: boolean,
    issueDate: Date
  ) {
    const calculateVAT = policiesRegister.applyPolicy(VATPolicy.getType(), [
      address,
      !individualConfirmed,
      individualConfirmed ? false : true,
      issueDate,
    ]);

    const VATNote = calculateVAT.getVATNote();
    return VATNote;
  }
}
