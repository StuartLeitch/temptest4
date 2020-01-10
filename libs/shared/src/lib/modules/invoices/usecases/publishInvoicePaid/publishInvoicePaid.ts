import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { InvoicePaid as InvoicePaidEvent } from '@hindawi/phenom-events';
import { InvoiceItemType } from '@hindawi/phenom-events/src/lib/invoiceItem';
import { EventUtils } from '../../../../utils/EventUtils';

const INVOICE_PAID_EVENT = 'InvoicePaid';

export class PublishInvoicePaid {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    paymentDetails: InvoicePaymentInfo
  ): Promise<any> {
    const data: InvoicePaidEvent = {
      ...EventUtils.createEventObject(),
      invoiceId: invoice.id.toString(),
      invoiceCreatedDate: invoice.dateCreated,
      valueWithoutVAT: invoiceItems.reduce((acc, curr) => acc + curr.price, 0),
      invoiceItems: invoiceItems.map(ii => ({
        id: ii.id.toString(),
        manuscriptCustomId: manuscript.customId,
        manuscriptId: ii.manuscriptId.id.toString(),
        type: ii.type as InvoiceItemType,
        price: ii.price,
        vatPercentage: ii.vat
      })),
      transactionId: paymentDetails.transactionId,
      invoiceStatus: paymentDetails.invoiceStatus as any,
      referenceNumber: `${invoice.invoiceNumber
        .toString()
        .padStart(5, '0')}/${invoice.dateAccepted.getFullYear()}`,
      invoiceIssueDate: paymentDetails.invoiceIssueDate
        ? new Date(paymentDetails.invoiceIssueDate)
        : null,
      payerName: paymentDetails.payerName,
      payerEmail: paymentDetails.payerEmail,
      payerType: paymentDetails.payerType as any,
      vatRegistrationNumber: paymentDetails.vatRegistrationNumber,
      address: `${paymentDetails.address}, ${paymentDetails.city}, ${paymentDetails.country}`,
      country: paymentDetails.country,
      foreignPaymentId: paymentDetails.foreignPaymentId,
      paymentDate: paymentDetails.paymentDate
        ? new Date(paymentDetails.paymentDate)
        : null,
      paymentType: paymentDetails.paymentType,
      paymentAmount: paymentDetails.amount
      // VAT: "todo"
      // couponId: coupon.id,
      // dateApplied: coupon.applied
    };

    try {
      await this.publishService.publishMessage({
        event: INVOICE_PAID_EVENT,
        data
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
