import { createClient } from 'soap';
import EuroVat from 'eu-vat';

import { environment } from '@env/environment';

import { PoliciesRegister } from '../../modules/invoices/domain/policies/PoliciesRegister';
import { UKVATTreatmentArticleProcessingChargesPolicy } from './../../modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';
import { USVATPolicy } from './../../modules/invoices/domain/policies/USVATPolicy';
import { Address as VATAddress } from '../../modules/invoices/domain/policies/Address';

const { VAT_VALIDATION_SERVICE_ENDPOINT: endpoint } = environment;
const INVALID_INPUT = 'soap:Server: INVALID_INPUT';

const vat = new EuroVat();
const policiesRegister = new PoliciesRegister();

let VATPolicy: USVATPolicy | UKVATTreatmentArticleProcessingChargesPolicy;

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
      createClient(endpoint, (err, client) => {
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
    vatNumber
  }: {
    countryCode: string;
    vatNumber: string;
  }): Promise<any> {
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
          error = new Error('Invalid Input');
      }

      return error;
    }

    return result;
  }

  public async getRates(countryCode?: string) {
    const rates = await vat.getRates(countryCode);
    return rates;
  }

  public calculateVAT(address?: VATAddress, individualConfirmed?: boolean) {
    const calculateVAT = policiesRegister.applyPolicy(VATPolicy.getType(), [
      address,
      !individualConfirmed,
      individualConfirmed ? false : true
    ]);

    const VAT = calculateVAT.getVAT();
    return VAT;
  }

  public getVATNote(address?: VATAddress, individualConfirmed?: boolean) {
    const calculateVAT = policiesRegister.applyPolicy(VATPolicy.getType(), [
      address,
      !individualConfirmed,
      individualConfirmed ? false : true
    ]);

    const VATNote = calculateVAT.getVATNote();
    return VATNote;
  }
}
