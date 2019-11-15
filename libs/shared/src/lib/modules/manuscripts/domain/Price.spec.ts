import {Result} from '../../../core/logic/Result';
import {Price} from './Price';
import {PriceValue} from './PriceValue';

let priceOrError: Result<Price>;
const price = 100;

describe('Price', () => {
  beforeEach(() => {
    // price = null;
    priceOrError = null;
  });

  it('Should be able to be created', () => {
    priceOrError = Price.create({
      value: PriceValue.create(price).getValue()
    });

    expect(priceOrError.isSuccess).toBeTruthy();
  });
});
