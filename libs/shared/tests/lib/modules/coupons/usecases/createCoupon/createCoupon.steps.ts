import { expect } from 'chai';
import { Given, Then, Before, After } from '@cucumber/cucumber';

import { CreateCouponUsecase } from '../../../../../../src/lib/modules/coupons/usecases/createCoupon';
import { CreateCouponResponse } from '../../../../../../src/lib/modules/coupons/usecases/createCoupon/createCouponResponse';

import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

let mockCouponRepo: MockCouponRepo = null;
let usecase: CreateCouponUsecase = null;
let response: CreateCouponResponse = null;
let mockAuditLogger = { log: () => null };

Before({ tags: '@ValidateCreateCoupon' }, () => {
  mockCouponRepo = new MockCouponRepo();
  usecase = new CreateCouponUsecase(mockCouponRepo, mockAuditLogger);
});

After({ tags: '@ValidateCreateCoupon' }, () => {
  mockCouponRepo = null;
  usecase = null;
});

Given(
  /^I execute the usecase for a coupon with ID "([\w-]+)" and code "([\w-]+)"/,
  async (testId: string, testCode: string) => {
    const couponDetails = {
      id: testId,
      invoiceItemType: 'APC',
      expirationDate: '2022-03-12',
      type: 'MULTIPLE_USE',
      reduction: 30,
      status: 'ACTIVE',
      code: testCode,
      name: 'testCoupon',
    };
    response = await usecase.execute(couponDetails, context);
  }
);

Then(/^the coupon should be created/, () => {
  expect(response.isRight()).to.be.true;
});

Given(
  /^I execute the usecase for an inactive coupon with ID "([\w-]+)" and code "([\w-]+)"/,
  async (testId: string, testCode: string) => {
    const couponDetails = {
      id: testId,
      invoiceItemType: 'APC',
      expirationDate: '2022-03-12',
      type: 'MULTIPLE_USE',
      reduction: 30,
      status: 'INACTIVE',
      code: testCode,
      name: 'testCoupon',
    };
    response = await usecase.execute(couponDetails, context);
  }
);

Then(/^the coupon should not be created/, () => {
  expect(response.isLeft()).to.be.true;
});
