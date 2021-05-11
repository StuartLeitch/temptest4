import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';

import { CouponAssignedCollection } from '../../../../../../src/lib/modules/coupons/domain/CouponAssignedCollection';
import { CouponAssigned } from '../../../../../../src/lib/modules/coupons/domain/CouponAssigned';
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
    dateCreated: new Date(),
    ...overwrites,
  });
}

let mockCouponRepo: MockCouponRepo;
let coupon: Coupon;
let couponList: Coupon[];
let result: CouponAssignedCollection;

Before(async () => {
  mockCouponRepo = new MockCouponRepo();
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

Then(/^it should add the coupon to invoice item/, () => {
  expect(result.length).to.be.greaterThan(0);
});

When(/^we call getCouponById for "([\w-]+)"/, async (testCouponId: string) => {
  const couponId = CouponId.create(new UniqueEntityID(testCouponId)).getValue();
  coupon = await mockCouponRepo.getCouponById(couponId);
});

Then(/^it should return the coupon/, () => {
  expect(!!coupon).to.be.true;
});

When(
  /^we call getCouponByCode for code "([\w-]+)"/,
  async (testCode: string) => {
    const codeCoupon = CouponCode.create(testCode).getValue();
    coupon = await mockCouponRepo.getCouponByCode(codeCoupon);
  }
);
