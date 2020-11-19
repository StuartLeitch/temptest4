import { InvoiceDraftCreated as InvoiceDraftCreatedEvent } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Result';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';
import { formatInvoiceItems, formatCosts } from '../eventFormatters';

import { PublishInvoiceDraftCreatedResponse as Response } from './publishInvoiceDraftCreated.response';
import { PublishInvoiceDraftCreatedDTO as DTO } from './publishInvoiceDraftCreated.dto';
import * as Errors from './publishInvoiceDraftCreated.errors';

const INVOICE_DRAFT_CREATED = 'InvoiceDraftCreated';

export class PublishInvoiceDraftCreatedUseCase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    const maybeValidRequest = this.verifyInput(request);
    if (maybeValidRequest.isLeft()) {
      return maybeValidRequest;
    }

    const { messageTimestamp, invoiceItems, manuscript, invoice } = request;

    const erpReference = invoice
      .getErpReferences()
      .getItems()
      .filter((er) => er.vendor === 'netsuite' && er.attribute === 'erp')
      .find(Boolean);

    const data: InvoiceDraftCreatedEvent = {
      ...EventUtils.createEventObject(),
      transactionId: invoice.transactionId.toString(),
      referenceNumber: invoice.referenceNumber,
      erpReference: erpReference?.value ?? null,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: false,

      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated?.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),
      lastPaymentDate: null,

      costs: formatCosts(invoiceItems, [], invoice),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      preprintValue: manuscript.preprintValue,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_DRAFT_CREATED,
        data,
      });
      return right(null);
    } catch (err) {
      return left(new Errors.SQSServiceFailure(err));
    }
  }

  private verifyInput(
    request: DTO
  ): Either<
    | Errors.InvoiceItemsRequiredError
    | Errors.InvoiceRequiredError
    | Errors.ManuscriptRequiredError,
    void
  > {
    if (!request.invoiceItems) {
      return left(new Errors.InvoiceItemsRequiredError());
    }

    if (!request.manuscript) {
      return left(new Errors.ManuscriptRequiredError());
    }

    if (!request.invoice) {
      return left(new Errors.InvoiceRequiredError());
    }
    return right(null);
  }
}
