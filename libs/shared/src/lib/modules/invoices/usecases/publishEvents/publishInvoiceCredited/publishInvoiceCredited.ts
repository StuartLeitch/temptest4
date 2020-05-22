import { InvoiceCreditNoteCreated as InvoiceCreditNoteCreatedEvent } from '@hindawi/phenom-events';

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

const INVOICE_CREDITED = 'InvoiceCreditNoteCreated';

export class PublishInvoiceCredited {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    paymentMethods: PaymentMethod[],
    invoiceItems: InvoiceItem[],
    billingAddress: Address,
    manuscript: Manuscript,
    payments: Payment[],
    creditNote: Invoice,
    payer: Payer,
    messageTimestamp?: Date
  ): Promise<void> {
    const data: InvoiceCreditNoteCreatedEvent = {
      ...EventUtils.createEventObject(),

      cancelledInvoiceReference: creditNote.cancelledInvoiceReference,
      referenceNumber: `CN-${creditNote.referenceNumber}`,
      transactionId: creditNote.transactionId.toString(),
      erpReference: creditNote.erpReference,
      invoiceId: creditNote.id.toString(),
      invoiceStatus: creditNote.status,
      isCreditNote: false,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: creditNote?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: creditNote?.dateAccepted?.toISOString(),
      invoiceCreatedDate: creditNote?.dateCreated?.toISOString(),
      invoiceIssuedDate: creditNote?.dateIssued?.toISOString(),

      costs: formatCosts(invoiceItems, payments),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),

      payments: formatPayments(payments, paymentMethods),
    } as any;

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_CREDITED,
        data,
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
