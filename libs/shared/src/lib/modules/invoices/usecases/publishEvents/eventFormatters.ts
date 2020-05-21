import {
  InvoiceItem as PhenomInvoiceItem,
  CouponApplicableInvoiceItemType,
  CouponType as PhenomCouponType,
  InvoiceCoupon as PhenomCoupon,
  InvoiceWaiver as PhenomWaiver,
  InvoiceCosts as PhenomCosts,
  InvoicePayer as PhenomPayer,
} from '@hindawi/phenom-events/src/lib/invoice';

import { Address } from '../../../addresses/domain/Address';
import { Coupons } from '../../../coupons/domain/Coupons';
import { Waiver } from '../../../waivers/domain/Waiver';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';

export function formatCoupons(coupons: Coupons): PhenomCoupon[] {
  if (!coupons) return undefined;
  return coupons.map((coupon) => ({
    applicableToInvoiceItemType: coupon.invoiceItemType as CouponApplicableInvoiceItemType,
    couponExpirationDate: coupon.expirationDate.toISOString(),
    couponCreatedDate: coupon.dateCreated.toISOString(),
    couponUpdatedDate: coupon.dateUpdated.toISOString(),
    couponType: coupon.couponType as PhenomCouponType,
    couponReduction: coupon.reduction,
    code: coupon.code.toString(),
    id: coupon.id.toString(),
  }));
}

export function formatWaiver(waivers: Waiver[]): PhenomWaiver[] {
  if (!waivers) return undefined;
  return waivers.map((waiver) => ({
    waiverReduction: waiver.reduction,
    waiverType: waiver.waiverType,
  }));
}

export function formatPayer(
  payer: Payer,
  billingAddress: Address
): PhenomPayer {
  return {
    billingAddress: `${billingAddress.addressLine1} ${billingAddress.city} ${billingAddress.country}`,
    organization: payer.organization.toString(),
    vatRegistrationNumber: payer.VATId,
    firstName: payer.name.toString(),
    email: payer.email.toString(),
    countryCode: billingAddress.country,
    type: payer.type,
    lastName: null,
  };
}

function itemReduction(item: InvoiceItem): number {
  const couponTotal = item.coupons.reduce((acc, c) => acc + c.reduction, 0);
  const waiverTotal = item.waivers.reduce((acc, w) => acc + w.reduction, 0);
  const totalReduction = Math.min(couponTotal + waiverTotal, 100);
  return (item.price * totalReduction) / 100;
}

export function formatCosts(invoiceItems: InvoiceItem[]): PhenomCosts {
  const apcItems = invoiceItems.filter((item) => item.type === 'APC');
  const totalPrice = apcItems.reduce((acc, item) => acc + item.price, 0);
  const vatAmount = apcItems.reduce(
    (acc, item) => acc + (item.price * item.vat) / 100,
    0
  );
  const totalDiscount = apcItems.reduce(
    (acc, item) => acc + itemReduction(item),
    0
  );

  return {
    netAmount: totalPrice - totalDiscount + vatAmount,
    dueAmount: totalPrice - totalDiscount + vatAmount,
    netApc: totalPrice - totalDiscount,
    grossApc: totalPrice,
    paidAmount: 0,
    totalDiscount,
    vatAmount,
  };
}

export function formatInvoiceItems(
  invoiceItems: InvoiceItem[],
  manuscriptCustomId: string
): PhenomInvoiceItem[] {
  return invoiceItems.map((invoiceItem) => ({
    id: invoiceItem.id.toString(),
    manuscriptCustomId,
    manuscriptId: invoiceItem.manuscriptId.id.toString(),
    type: invoiceItem.type as any,
    price: invoiceItem.price,
    vatPercentage: invoiceItem.vat,
    coupons: formatCoupons(invoiceItem.coupons),
    waivers: formatWaiver(invoiceItem.waivers),
  }));
}
