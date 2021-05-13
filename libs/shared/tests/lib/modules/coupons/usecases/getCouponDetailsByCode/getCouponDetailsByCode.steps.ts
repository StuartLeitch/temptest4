import { expect } from 'chai';
import { Given, Then, Before, When } from '@cucumber/cucumber';

import { GetCouponDetailsByCodeUsecase } from '../../../../../../src/lib/modules/coupons/usecases/getCouponDetailsByCode/getCouponDetailsByCode';
import { GetCouponDetailsByCodeResponse } from '../../../../../../src/lib/modules/coupons/usecases/getCouponDetailsByCode/getCouponDetailsByCodeResponse';

import { Coupon } from '../../../../../../src/lib/modules/coupons/domain/Coupon';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import {
  Roles,
  CouponMap,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';

function makeCouponData(id: string, code: string, overwrites?: any): Coupon {
  return CouponMap.toDomain({
    id,
    code,
    status: 'ACTIVE',
    redeemCount: 1,
    dateCreated: new Date(),
    invoiceItemType: 'APC',
    name: 'test-coupon',
    ...overwrites,
  });
}

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

let coupon: Coupon;
let mockCouponRepo: MockCouponRepo;
let usecase: GetCouponDetailsByCodeUsecase;
let response: GetCouponDetailsByCodeResponse;

Before(() => {
  mockCouponRepo = new MockCouponRepo();
  usecase = new GetCouponDetailsByCodeUsecase(mockCouponRepo);
});

Given(
  /^I have a coupon "([\w-]+)" with code "([\w-]+)"/,
  async (testId: string, testCode: string) => {
    coupon = makeCouponData(testId, testCode);
    coupon = await mockCouponRepo.save(coupon);
  }
);

When(/^I call the usecase with code "([\w-]+)"/, async (testCode: string) => {
  response = await usecase.execute({ couponCode: testCode }, context);
});

Then(/^I should receive the coupon/, () => {
  expect(response.isRight()).to.be.true;
});

Then(/^I should not receive the coupon/, () => {
  expect(response.isLeft()).to.be.true;
});
