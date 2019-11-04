import {createClient} from 'soap';
import EuroVat from 'eu-vat';

require('dotenv').config();

const {VAT_VALIDATION_SERVICE_ENDPOINT: endpoint} = process.env;
const INVALID_INPUT = 'soap:Server: INVALID_INPUT';
const vat = new EuroVat();

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
      result = await this.checkVat(client, {countryCode, vatNumber});
    } catch (err) {
      let error;
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
}
