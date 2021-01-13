import { expect } from 'chai';
import { Given, When, Then } from '@cucumber/cucumber';

import { ExchangeRateService } from '../../../../../src/lib/domain/services/ExchangeRateService';

const exchangeRateService: ExchangeRateService = new ExchangeRateService();

let exDate: Date;
let currency: string;
let result: { exchangeRate: number };

Given(/^The against currency is (\w+)$/, async function (curr: string) {
  exDate = new Date('2020-04-23T14:55:37.670Z');
  currency = curr;
});

When('The exchange rate is queried', async () => {
  result = await exchangeRateService.getExchangeRate(exDate, currency);
});

Then(/^The value should be (\d.+)$/, async (rate: string) => {
  const { exchangeRate } = result;
  expect(exchangeRate).to.equal(parseFloat(rate));
});
