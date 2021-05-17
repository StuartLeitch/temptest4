import { expect } from 'chai';
import { Given, Then, Before, When, After } from '@cucumber/cucumber';

import { UpdateCouponUsecase } from '../../../../../../src/lib/modules/coupons/usecases/updateCoupon';
import { UpdateCouponResponse } from '../../../../../../src/lib/modules/coupons/usecases/updateCoupon/updateCouponResponse';

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
    reduction: 20,
    dateCreated: new Date(),
    invoiceItemType: 'APC',
    name: 'test-coupon',
    ...overwrites,
  });
}

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

let coupon: Coupon = null;
let mockCouponRepo: MockCouponRepo = null;
let usecase: UpdateCouponUsecase = null;
let response: UpdateCouponResponse = null;

Before({ tags: '@ValidateUpdateCoupon' }, () => {
  mockCouponRepo = new MockCouponRepo();
  usecase = new UpdateCouponUsecase(mockCouponRepo);
});

After({ tags: '@ValidateUpdateCoupon' }, () => {
  mockCouponRepo = null;
  usecase = null;
});

Given(
  /^the coupon "([\w-]+)" with "([\w-]+)"/,
  async (testId: string, testCode: string) => {
    coupon = makeCouponData(testId, testCode);
    coupon = await mockCouponRepo.save(coupon);
  }
);

When(
  /^I execute updateCouponUsecase for id "([\w-]+)"/,
  async (testId: string) => {
    const updatedDetails = {
      reduction: 30,
      id: testId,
    };
    response = await usecase.execute(updatedDetails, context);
  }
);

Then(/^I should see the modification on coupon/, () => {
  expect(response.isRight()).to.be.true;
  expect(response.value.getValue())
    .to.have.property('props')
    .to.have.property('reduction')
    .to.equal(30);
});

When(
  /^I execute updateCouponUsecase without changes for "([\w-]+)"/,
  async (testId: string) => {
    response = await usecase.execute({ id: testId }, context);
  }
);

Then(/^I should see the original details on coupon/, () => {
  expect(response.isRight()).to.be.true;
  expect(response.value.getValue())
    .to.have.property('props')
    .to.have.property('reduction')
    .to.equal(20);
});
