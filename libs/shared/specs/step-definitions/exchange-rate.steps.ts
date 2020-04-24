import { defineFeature, loadFeature } from 'jest-cucumber';
import parse from 'date-fns/parse';

import { ExchangeRateService } from '../../src/lib/domain/services/ExchangeRateService';

const feature = loadFeature('../features/exchange-rate.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  const exchangeRateService: ExchangeRateService = new ExchangeRateService();

  let exDate: Date;
  let currency: string;
  let result: any;
  // let vatResponse: any;

  test('Get exchange rate on a specific date', ({ given, when, and, then }) => {
    // given(
    //   /^The date is ((0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[012])[- /.](19|20)?[0-9]{2})*$/,
    //   (date: string) => {
    //     exDate = parse(date, 'dd/MM/yyyy', new Date());
    //   }
    // );

    given(/^The against currency is (\w+)$/, (curr: string) => {
      exDate = new Date('2020-04-23T14:55:37.670Z');
      currency = curr;
    });

    when('The exchange rate is queried', async () => {
      result = await exchangeRateService.getExchangeRate(exDate, currency);
    });

    then(/^The value should be (\d.+)$/, async (rate: string) => {
      const { exchangeRate } = result;
      expect(exchangeRate).toBe(parseFloat(rate));
    });
  });
});
