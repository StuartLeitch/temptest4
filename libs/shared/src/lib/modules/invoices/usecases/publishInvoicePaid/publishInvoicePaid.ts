import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
// import { InvoicePaid as InvoicePaidEvent } from '@hindawi/phenom-events';
import { InvoiceItemType } from '@hindawi/phenom-events/src/lib/invoiceItem';
import { EventUtils } from '../../../../utils/EventUtils';
import { CouponMap } from '../../../coupons/mappers/CouponMap';
import { WaiverMap } from '../../../waivers/mappers/WaiverMap';

const INVOICE_PAID_EVENT = 'InvoicePaid';

export class PublishInvoicePaid {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    paymentDetails: InvoicePaymentInfo,
    messageTimestamp?: Date
  ): Promise<any> {
    // const data: InvoicePaidEvent
    const data = {
      ...EventUtils.createEventObject(),
      invoiceId: invoice.id.toString(),
      erpReference: invoice.erpReference,
      invoiceCreatedDate: invoice.dateCreated.toISOString(),
      valueWithoutVAT: invoiceItems.reduce((acc, curr) => acc + curr.price, 0),
      invoiceItems: invoiceItems.map(ii => ({
        id: ii.id.toString(),
        manuscriptCustomId: manuscript.customId,
        manuscriptId: ii.manuscriptId.id.toString(),
        type: ii.type as InvoiceItemType,
        price: ii.price,
        vatPercentage: ii.vat,
        coupons: ii.coupons
          ? ii.coupons.map(c => CouponMap.toEvent(c))
          : undefined,
        waivers: ii.waivers
          ? ii.waivers.map(w => WaiverMap.toEvent(w))
          : undefined
      })),
      transactionId: paymentDetails.transactionId,
      invoiceStatus: paymentDetails.invoiceStatus as any,
      referenceNumber: invoice.referenceNumber,
      invoiceIssueDate: paymentDetails.invoiceIssueDate
        ? new Date(paymentDetails.invoiceIssueDate).toISOString()
        : null,
      payerName: paymentDetails.payerName,
      payerEmail: paymentDetails.payerEmail,
      payerType: paymentDetails.payerType as any,
      vatRegistrationNumber: paymentDetails.vatRegistrationNumber,
      address: `${paymentDetails.address}, ${paymentDetails.city}, ${paymentDetails.country}`,
      country: paymentDetails.country,
      foreignPaymentId: paymentDetails.foreignPaymentId,
      paymentDate: paymentDetails.paymentDate
        ? new Date(paymentDetails.paymentDate).toISOString()
        : null,
      paymentType: paymentDetails.paymentType,
      paymentAmount: paymentDetails.amount
      // VAT: "todo"
      // couponId: coupon.id,
      // dateApplied: coupon.applied
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_PAID_EVENT,
        data
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
