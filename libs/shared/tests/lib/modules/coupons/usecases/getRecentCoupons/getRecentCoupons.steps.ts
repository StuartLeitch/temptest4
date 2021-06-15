import { expect } from 'chai';
import { Given, Then, Before, When, After } from '@cucumber/cucumber';

import { GetRecentCouponsUsecase } from '../../../../../../src/lib/modules/coupons/usecases/getRecentCoupons/getRecentCoupons';
import { GetRecentCouponsResponse } from '../../../../../../src/lib/modules/coupons/usecases/getRecentCoupons/getRecentCouponsResponse';

import { Coupon } from '../../../../../../src/lib/modules/coupons/domain/Coupon';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import {
  Roles,
  CouponMap,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';

function makeCouponData(id: string, code: string, overwrites?: any): Coupon {
  const coupon = CouponMap.toDomain({
    id,
    code,
    status: 'ACTIVE',
    redeemCount: 1,
    dateCreated: new Date(),
    invoiceItemType: 'APC',
    name: 'test-coupon',
    ...overwrites,
  });

  if (coupon.isLeft()) {
    throw coupon.value;
  }

  return coupon.value;
}

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

let coupon: Coupon = null;
let mockCouponRepo: MockCouponRepo = null;
let usecase: GetRecentCouponsUsecase = null;
let response: GetRecentCouponsResponse = null;

Before({ tags: '@ValidateGetRecentCoupons' }, () => {
  mockCouponRepo = new MockCouponRepo();
  usecase = new GetRecentCouponsUsecase(mockCouponRepo);
});

After({ tags: '@ValidateGetRecentCoupons' }, () => {
  mockCouponRepo = null;
  usecase = null;
});
Given(
  /^I have the coupon "([\w-]+)" with "([\w-]+)"/,
  async (testId: string, testCode: string) => {
    coupon = makeCouponData(testId, testCode);
    const maybeCoupon = await mockCouponRepo.save(coupon);

    if (maybeCoupon.isLeft()) {
      throw maybeCoupon.value;
    }

    coupon = maybeCoupon.value;
  }
);

Given(/^I have no recently added coupons/, () => {});
When(/^I execute getRecentCouponsUsecase/, async () => {
  response = await usecase.execute({}, context);
});

Then(/^I should receive the recently added coupon/, () => {
  expect(response.isRight()).to.be.true;
  expect(response.value).to.have.property('totalCount').to.equal(1);
});

Then(/^I should not receive any coupon/, () => {
  expect(response.isRight()).to.be.true;
  expect(response.value).to.have.property('totalCount').to.equal(0);
});
