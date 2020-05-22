import { InvoiceFinalized as InvoiceFinalizedEvent } from '@hindawi/phenom-events';

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
  formatInvoiceItems,
  formatPayments,
  formatCosts,
  formatPayer,
} from '../eventFormatters';

const INVOICE_FINALIZED = 'InvoiceFinalized';

export class PublishInvoiceFinalized {
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
    const data: InvoiceFinalizedEvent = {
      ...EventUtils.createEventObject(),

      referenceNumber: this.formatReferenceNumber(invoice),
      transactionId: invoice.transactionId.toString(),
      erpReference: invoice.erpReference,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: false,

      lastPaymentDate: this.calculateLastPaymentDate(payments)?.toISOString(),
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
        event: INVOICE_FINALIZED,
        data,
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }

  private formatReferenceNumber(invoice: Invoice): string {
    if (!invoice.cancelledInvoiceReference) {
      return invoice.referenceNumber;
    } else {
      return `CN-${invoice.referenceNumber}`;
    }
  }

  private calculateLastPaymentDate(payments: Payment[]): Date | null {
    return payments.reduce((acc, payment) => {
      if (!acc) return payment.datePaid;
      if (acc < payment.datePaid) return payment.datePaid;
      return acc;
    }, null as Date);
  }
}
