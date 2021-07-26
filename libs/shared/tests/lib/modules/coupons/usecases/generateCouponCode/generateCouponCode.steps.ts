import { expect } from 'chai';
import { Given, Then, Before, After } from '@cucumber/cucumber';

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

let mockCouponRepo: MockCouponRepo = null;
let usecase: GenerateCouponCodeUsecase = null;
let response: GenerateCouponCodeResponse = null;

Before({ tags: '@ValidateGenerateCouponCode' }, () => {
  mockCouponRepo = new MockCouponRepo();
  usecase = new GenerateCouponCodeUsecase(mockCouponRepo);
});

After({ tags: '@ValidateGenerateCouponCode' }, () => {
  mockCouponRepo = null;
  usecase = null;
});

Given(
  /^I call the execution of the usecase generateCouponCodeUsecase/,
  async () => {
    response = await usecase.execute(null, context);
  }
);

Then(/^I expect a coupon code to be generated/, () => {
  expect(response.isRight()).to.be.true;
});
