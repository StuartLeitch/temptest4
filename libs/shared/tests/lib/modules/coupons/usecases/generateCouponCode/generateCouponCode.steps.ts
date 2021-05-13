import { expect } from 'chai';
import { Given, Then, Before } from '@cucumber/cucumber';

import { GenerateCouponCodeUsecase } from '../../../../../../src/lib/modules/coupons/usecases/generateCouponCode/generateCouponCode';
import { GenerateCouponCodeResponse } from '../../../../../../src/lib/modules/coupons/usecases/generateCouponCode/generateCouponCodeResponse';

import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/shared';

const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

let mockCouponRepo: MockCouponRepo;
let usecase: GenerateCouponCodeUsecase;
let response: GenerateCouponCodeResponse;

Before(() => {
  mockCouponRepo = new MockCouponRepo();
  usecase = new GenerateCouponCodeUsecase(mockCouponRepo);
});

Given(/^I call the execution of the usecase/, async () => {
  response = await usecase.execute(context);
});

Then(/^I expect a coupon code to be generated/, () => {
  expect(response.isRight()).to.be.true;
});
