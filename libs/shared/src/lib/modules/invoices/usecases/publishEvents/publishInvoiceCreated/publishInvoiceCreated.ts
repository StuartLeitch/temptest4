import { InvoiceCreated as InvoiceCreatedEvent } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Result';
import { AppError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

// * Authorization Logic
import { AccessControlContext } from '../../../../../domain/authorization/AccessControl';
import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';
import { Roles } from '../../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../../domain/authorization/decorators/Authorize';

import { formatInvoiceItems, formatCosts } from '../eventFormatters';

import { PublishInvoiceCreatedResponse as Response } from './publishInvoiceCreated.response';
import { PublishInvoiceCreatedDTO as DTO } from './publishInvoiceCreated.dto';
import * as Errors from './publishInvoiceCreated.errors';

type Context = AuthorizationContext<Roles>;
export type PublishInvoiceCreatedContext = Context;

const INVOICE_CREATED = 'InvoiceCreated';

export class PublishInvoiceCreatedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const validRequest = this.verifyInput(request);
    if (validRequest.isLeft()) {
      return validRequest;
    }

    const { messageTimestamp, invoiceItems, manuscript, invoice } = request;

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
      return right(null);
    } catch (err) {
      return left(new AppError.UnexpectedError(err.toString()));
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
