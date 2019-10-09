import {ReductionFactory} from './ReductionFactory';
import {ReductionProps} from './Reduction';

describe('ReductionFactory', () => {
  beforeEach(() => {});

  it('Should create a Discount instance', () => {
    let reductionType = 'DISCOUNT';
    const discount = ReductionFactory.createReduction(
      reductionType,
      {} as ReductionProps
    );

    expect(discount.type).toBe(reductionType);
  });

  it('Should create a Waiver instance', () => {
    const reductionType = 'WAIVER';
    const waiver = ReductionFactory.createReduction(
      reductionType,
      {} as ReductionProps
    );

    expect(waiver.type).toBe(reductionType);
  });

  it('Should create a Coupon instance', () => {
    const reductionType = 'COUPON';
    const coupon = ReductionFactory.createReduction(
      reductionType,
      {} as ReductionProps
    );

    expect(coupon.type).toBe(reductionType);
  });
});
