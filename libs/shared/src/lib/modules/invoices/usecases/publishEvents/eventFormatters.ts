import {
  InvoiceItem as PhenomInvoiceItem,
  CouponApplicableInvoiceItemType,
  InvoicePayment as PhenomPayment,
  CouponType as PhenomCouponType,
  InvoiceCoupon as PhenomCoupon,
  InvoiceWaiver as PhenomWaiver,
  InvoiceCosts as PhenomCosts,
  InvoicePayer as PhenomPayer,
} from '@hindawi/phenom-events/src/lib/invoice';

import { Name } from '../../../../domain/Name';

import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Address } from '../../../addresses/domain/Address';
import { Payment, PaymentStatus } from '../../../payments/domain/Payment';
import { Coupon } from '../../../coupons/domain/Coupon';
import { Waiver } from '../../../waivers/domain/Waiver';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';

export function formatCoupons(coupons: Coupon[]): PhenomCoupon[] {
  if (!coupons) return undefined;
  return coupons.map((coupon) => ({
    applicableToInvoiceItemType: coupon.invoiceItemType as CouponApplicableInvoiceItemType,
    couponExpirationDate: coupon?.expirationDate?.toISOString(),
    couponCreatedDate: coupon?.dateCreated?.toISOString(),
    couponUpdatedDate: coupon?.dateUpdated?.toISOString(),
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

function formatOrganization(organization: Name): string {
  if (!organization || organization.toString() === ' ') {
    return null;
  } else {
    return organization.toString();
  }
}

export function formatPayer(
  payer: Payer,
  billingAddress: Address
): PhenomPayer {
  return {
    billingAddress: billingAddress
      ? `${billingAddress.addressLine1} ${billingAddress.city} ${billingAddress.country}`
      : null,
    countryCode: billingAddress ? billingAddress.country : null,
    organization: formatOrganization(payer.organization),
    vatRegistrationNumber: payer.VATId,
    firstName: payer.name.toString(),
    email: payer.email.toString(),
    type: payer.type,
    lastName: null,
  };
}

function itemReduction(item: InvoiceItem): number {
  let couponTotal = 0;
  let waiverTotal = 0;

  if (item.assignedCoupons) {
    couponTotal = item.assignedCoupons.coupons.reduce(
      (acc, c) => acc + c.reduction,
      0
    );
  }

  if (item.assignedWaivers) {
    waiverTotal = item.assignedWaivers.waivers.reduce(
      (acc, w) => acc + w.reduction,
      0
    );
  }

  const totalReduction = Math.min(couponTotal + waiverTotal, 100);
  return (item.price * totalReduction) / 100;
}

function calculateVatForItem(item: InvoiceItem): number {
  const reductions = itemReduction(item);
  return ((item.price - reductions) * item.vat) / 100;
}

export function formatCosts(
  invoiceItems: InvoiceItem[],
  payments: Payment[],
  invoice: Invoice
): PhenomCosts {
  const apcItems = invoiceItems.filter((item) => item.type === 'APC');
  const totalPrice = apcItems.reduce((acc, item) => acc + item.price, 0);
  const vatAmount = apcItems.reduce(
    (acc, item) => acc + calculateVatForItem(item),
    0
  );
  const totalDiscount = apcItems.reduce(
    (acc, item) => acc + itemReduction(item),
    0
  );
  const paid = payments
    .filter((payment) => payment.status === PaymentStatus.COMPLETED)
    .reduce((acc, payment) => acc + payment.amount.value, 0);
  const dueAmount = totalPrice - totalDiscount + vatAmount - paid;

  return {
    dueAmount: invoice.cancelledInvoiceReference ? 0 : dueAmount,
    netAmount: totalPrice - totalDiscount + vatAmount,
    netApc: totalPrice - totalDiscount,
    grossApc: totalPrice,
    paidAmount: paid,
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
    coupons: formatCoupons(invoiceItem.assignedCoupons.coupons),
    waivers: formatWaiver(invoiceItem.assignedWaivers.waivers),
  }));
}

export function formatPayments(
  payments: Payment[],
  paymentMethods: PaymentMethod[]
): PhenomPayment[] {
  const methods: { [key: string]: PaymentMethod } = paymentMethods.reduce(
    (acc, method) => {
      acc[method.id.toString()] = method;
      return acc;
    },
    {}
  );

  return payments
    .filter((payment) => payment.status === PaymentStatus.COMPLETED)
    .map((payment) => ({
      paymentType: methods[payment.paymentMethodId.toString()].name,
      paymentDate: payment?.datePaid?.toISOString(),
      foreignPaymentId: payment.foreignPaymentId,
      paymentAmount: payment.amount.value,
    }));
}

export function calculateLastPaymentDate(payments: Payment[]): Date | null {
  return payments
    .filter((payment) => payment.status === PaymentStatus.COMPLETED)
    .reduce((acc, payment) => {
      if (!acc) return payment.datePaid;
      if (acc < payment.datePaid) return payment.datePaid;
      return acc;
    }, null as Date);
}
