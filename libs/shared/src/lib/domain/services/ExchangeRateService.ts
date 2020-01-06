import { environment } from '@env/environment';
import fs from 'fs';
import path from 'path';
import format from 'date-fns/format';

const parser = require('xml2json');

export class ExchangeRateService {
  public async getExchangeRate(date: Date, currency: string) {
    let rates: any;

    try {
      rates = await this.readFile(this.getFilePathFromDate(date));
    } catch (err) {
      console.error(err);
    }

    if (!('exchangeRateMonthList' in rates)) {
      return null;
    }

    if (!('exchangeRate' in rates['exchangeRateMonthList'])) {
      return null;
    }

    const exchangeRates = rates['exchangeRateMonthList']['exchangeRate'];
    const foundByCurrency = exchangeRates.find(
      (er: any) => er.currencyCode === currency
    );

    return { exchangeRate: parseFloat(foundByCurrency.rateNew) };
  }

  private getFilePathFromDate(date: Date) {
    const month = format(date, 'MM');
    const year = format(date, 'yyyy').substr(-2);

    return path.join(__dirname, 'exrates', `${month}${year}.xml`);
  }

  private async readFile(filePath: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(parser.toJson(data, { object: true, sanitize: true }));
      });
    });
  }
}
