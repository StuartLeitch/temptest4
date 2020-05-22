import { InvoiceConfirmed as InvoiceConfirmedEvent } from '@hindawi/phenom-events';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';
import { AppError } from '../../../../../core/logic/AppError';
import { EventUtils } from '../../../../../utils/EventUtils';

import { Manuscript } from '../../../../manuscripts/domain/Manuscript';
import { Address } from '../../../../addresses/domain/Address';
import { InvoiceItem } from '../../../domain/InvoiceItem';
import { Payer } from '../../../../payers/domain/Payer';
import { Invoice } from '../../../domain/Invoice';

import {
  formatInvoiceItems,
  formatCosts,
  formatPayer,
} from '../eventFormatters';

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

      costs: formatCosts(invoiceItems, []),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),
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
}
