/* eslint-disable @typescript-eslint/no-unused-vars */

import { InvoiceCreated as InvoiceCreatedEvent } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
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

import { PublishInvoiceCreatedResponse as Response } from './publishInvoiceCreated.response';
import { PublishInvoiceCreatedDTO as DTO } from './publishInvoiceCreated.dto';
import * as Errors from './publishInvoiceCreated.errors';

const INVOICE_CREATED = 'InvoiceCreated';

export class PublishInvoiceCreatedUsecase
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
    const validRequest = this.verifyInput(request);
    if (validRequest.isLeft()) {
      return validRequest;
    }

    const { messageTimestamp, invoiceItems, manuscript, invoice } = request;

    const erpReference = invoice
      .getErpReferences()
      .getItems()
      .filter((er) => er.vendor === 'netsuite' && er.attribute === 'erp')
      .find(Boolean);

    const data: InvoiceCreatedEvent = {
      ...EventUtils.createEventObject(),

      transactionId: invoice.transactionId.toString(),
      referenceNumber: invoice.referenceNumber,
      erpReference: erpReference.value,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: false,

      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
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
        event: INVOICE_CREATED,
        data,
      });
      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err.toString()));
    }
  }

  private verifyInput(
    request: DTO
  ): Either<
    | Errors.InvoiceItemsRequiredError
    | Errors.ManuscriptRequiredError
    | Errors.InvoiceRequiredError,
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
