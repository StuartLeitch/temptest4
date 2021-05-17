import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

import { CouponAssignedCollection } from '../../../../../../src/lib/modules/coupons/domain/CouponAssignedCollection';
import { CouponCode } from '../../../../../../src/lib/modules/coupons/domain/CouponCode';
import { CouponId } from '../../../../../../src/lib/modules/coupons/domain/CouponId';
import { Coupon } from '../../../../../../src/lib/modules/coupons/domain/Coupon';
import { CouponMap } from '../../../../../../src/lib/modules/coupons/mappers/CouponMap';
import { InvoiceItemId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItemId';

import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';

function makeCouponData(id: string, code: string, overwrites?: any): Coupon {
  return CouponMap.toDomain({
    id,
    code,
    status: 'ACTIVE',
    redeemCount: 1,
    dateCreated: new Date(),
    ...overwrites,
  });
}

let mockCouponRepo: MockCouponRepo = null;
let coupon: Coupon = null;
let incrementedCoupon: Coupon = null;
let updatedCoupon: Coupon = null;
let couponList: Coupon[] = null;
let result: CouponAssignedCollection = null;
let resultUsedCode: boolean = null;

Before({ tags: '@ValidateKnexCouponRepo' }, async () => {
  mockCouponRepo = new MockCouponRepo();
});

After({ tags: '@ValidateKnexCouponRepo' }, () => {
  mockCouponRepo = null;
});

Given(
  /^a coupon "([\w-]+)" with code "([\w-]+)"/,
  async (testCouponId: string, testCode: string) => {
    coupon = makeCouponData(testCouponId, testCode);
    coupon = await mockCouponRepo.save(coupon);
  }
);

When(/^we call getCouponCollection/, async () => {
  couponList = await mockCouponRepo.getCouponCollection();
});

Then(/^it should get a list of coupons/, () => {
  expect(couponList.length).to.be.greaterThan(1);
});

When(/^we call getCouponsByInvoiceItemId/, async () => {
  const invoiceItemId = InvoiceItemId.create(
    new UniqueEntityID('testInvoiceItemId')
  );
  await mockCouponRepo.addMockCouponToInvoiceItem(coupon, invoiceItemId);

  result = await mockCouponRepo.getCouponsByInvoiceItemId(invoiceItemId);
});

Then(/^it should add the coupons to invoice item/, () => {
  expect(result.length).to.be.greaterThan(0);
});

When(/^we call getCouponById for "([\w-]+)"/, async (testCouponId: string) => {
  const couponId = CouponId.create(new UniqueEntityID(testCouponId)).getValue();
  coupon = await mockCouponRepo.getCouponById(couponId);
});

Then(/^it should return the coupon "([\w-]+)"/, (testCouponId: string) => {
  expect(!!coupon).to.be.true;
  expect(coupon.id.toValue()).to.equal(testCouponId);
});

When(
  /^we call getCouponByCode for code "([\w-]+)"/,
  async (testCode: string) => {
    const codeCoupon = CouponCode.create(testCode).getValue();
    coupon = await mockCouponRepo.getCouponByCode(codeCoupon);
  }
);

When(/^we call incrementRedeemedCount/, async () => {
  incrementedCoupon = await mockCouponRepo.incrementRedeemedCount(coupon);
});

Then(/^redeem count should be higher with 1/, () => {
  expect(incrementedCoupon.redeemCount).to.equal(2);
});

When(/^we call update method/, async () => {
  updatedCoupon = await mockCouponRepo.update(coupon);
});

Then(/^the coupon "([\w-]+)" should be updated/, (testCoupon: string) => {
  expect(!!updatedCoupon).to.be.true;
  expect(coupon.code).to.equal(updatedCoupon.code);
});

When(/^we call isCodeUsed with "([\w-]+)"/, async (testCode: string) => {
  resultUsedCode = await mockCouponRepo.isCodeUsed(testCode);
});

Then(/^it should return true/, () => {
  expect(resultUsedCode).to.be.true;
});
