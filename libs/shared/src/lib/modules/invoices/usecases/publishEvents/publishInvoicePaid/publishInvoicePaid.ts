import { InvoicePaid as InvoicePaidEvent } from '@hindawi/phenom-events';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';
import { AppError } from '../../../../../core/logic/AppError';
import { EventUtils } from '../../../../../utils/EventUtils';

import { PaymentMethod } from '../../../../payments/domain/PaymentMethod';
import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { Address } from '../../../../addresses/domain/Address';
import { Payment } from '../../../../payments/domain/Payment';
import { InvoiceItem } from '../../../domain/InvoiceItem';
import { Payer } from '../../../../payers/domain/Payer';
import { Invoice } from '../../../domain/Invoice';

import {
  calculateLastPaymentDate,
  formatInvoiceItems,
  formatPayments,
  formatCosts,
  formatPayer,
} from '../eventFormatters';

const INVOICE_PAID_EVENT = 'InvoicePaid';

export class PublishInvoicePaid {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    paymentMethods: PaymentMethod[],
    invoiceItems: InvoiceItem[],
    billingAddress: Address,
    manuscript: Manuscript,
    payments: Payment[],
    invoice: Invoice,
    payer: Payer,
    messageTimestamp?: Date
  ): Promise<void> {
    const data: InvoicePaidEvent = {
      ...EventUtils.createEventObject(),

      referenceNumber: invoice.referenceNumber,
      transactionId: invoice.transactionId.toString(),
      erpReference: invoice.erpReference,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: false,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated?.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),

      costs: formatCosts(invoiceItems, payments),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),

      payments: formatPayments(payments, paymentMethods),
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_PAID_EVENT,
        data,
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
