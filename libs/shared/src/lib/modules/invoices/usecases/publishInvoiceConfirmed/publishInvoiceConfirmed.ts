import { InvoiceConfirmed as InvoiceConfirmedEvent } from '@hindawi/phenom-events';
import {
  InvoiceItem as PhenomInvoiceItem,
  InvoiceCoupon as PhenomCoupon,
  InvoiceWaiver as PhenomWaiver,
  CouponApplicableInvoiceItemType,
  CouponType as PhenomCouponType,
  InvoicePayer as PhenomPayer,
  InvoiceCosts as PhenomCosts,
} from '@hindawi/phenom-events/src/lib/invoice';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { AppError } from '../../../../core/logic/AppError';
import { EventUtils } from '../../../../utils/EventUtils';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';
import { Coupons } from '../../../coupons/domain/Coupons';
import { Waiver } from '../../../waivers/domain/Waiver';

const INVOICE_CONFIRMED = 'InvoiceConfirmed';

export class PublishInvoiceConfirmed {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payer: Payer,
    billingAddress: Address,
    messageTimestamp?: Date
  ): Promise<any> {
    const data: InvoiceConfirmedEvent = {
      ...EventUtils.createEventObject(),

      transactionId: invoice.transactionId.toString(),
      referenceNumber: invoice.referenceNumber,
      erpReference: invoice.erpReference,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: false,

      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated?.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),
      lastPaymentDate: null,

      costs: this.formatCosts(invoiceItems),

      invoiceItems: this.formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: this.formatPayer(payer, billingAddress),
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_CONFIRMED,
        data,
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }

  private formatInvoiceItems(
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
      coupons: this.formatCoupons(invoiceItem.coupons),
      waivers: this.formatWaiver(invoiceItem.waivers),
    }));
  }

  private formatCoupons(coupons: Coupons): PhenomCoupon[] {
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

  private formatWaiver(waivers: Waiver[]): PhenomWaiver[] {
    if (!waivers) return undefined;
    return waivers.map((waiver) => ({
      waiverReduction: waiver.reduction,
      waiverType: waiver.waiverType,
    }));
  }

  private formatPayer(payer: Payer, billingAddress: Address): PhenomPayer {
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

  private itemReduction(item: InvoiceItem): number {
    const couponTotal = item.coupons.reduce((acc, c) => acc + c.reduction, 0);
    const waiverTotal = item.waivers.reduce((acc, w) => acc + w.reduction, 0);
    const totalReduction = Math.min(couponTotal + waiverTotal, 100);
    return (item.price * totalReduction) / 100;
  }

  private formatCosts(invoiceItems: InvoiceItem[]): PhenomCosts {
    const apcItems = invoiceItems.filter((item) => item.type === 'APC');
    const totalPrice = apcItems.reduce((acc, item) => acc + item.price, 0);
    const vatAmount = apcItems.reduce(
      (acc, item) => acc + (item.price * item.vat) / 100,
      0
    );
    const totalDiscount = apcItems.reduce(
      (acc, item) => acc + this.itemReduction(item),
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
}
