import { InvoiceCreated as InvoiceCreatedEvent } from '@hindawi/phenom-events';

import { Result, left, right } from '../../../../../core/logic/Result';
import { AppError } from '../../../../../core/logic/AppError';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';

import { PublishInvoiceCreatedResponse as Response } from './publishInvoiceCreatedResponse';
import { PublishInvoiceCreatedDTO as DTO } from './publishInvoiceCreatedDTO';
import * as Errors from './publishInvoiceCreatedErrors';

import { EventUtils } from '../../../../../utils/EventUtils';

import { formatInvoiceItems, formatCosts } from '../eventFormatters';

const INVOICE_CREATED = 'InvoiceCreated';

export class PublishInvoiceCreatedUsecase {
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO): Promise<Response> {
    const { invoice, invoiceItems, manuscript, messageTimestamp } = request;

    if (!invoiceItems || !manuscript || !invoice) {
      return left(new Errors.InputNotProvidedError());
    }

    const data: InvoiceCreatedEvent = {
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
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_CREATED,
        data,
      });
      return right(Result.ok<void>(null));
    } catch (err) {
      return left(new AppError.UnexpectedError(err.toString()));
    }
  }
}
