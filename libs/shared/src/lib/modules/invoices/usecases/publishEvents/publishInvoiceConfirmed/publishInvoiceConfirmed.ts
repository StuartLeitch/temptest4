import { InvoiceConfirmed as InvoiceConfirmedEvent } from '@hindawi/phenom-events';

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

import {
  formatInvoiceItems,
  formatCosts,
  formatPayer,
} from '../eventFormatters';

import { PublishInvoiceConfirmedResponse as Response } from './publishInvoiceConfirmed.response';
import { PublishInvoiceConfirmedDTO as DTO } from './publishInvoiceConfirmed.dto';
import * as Errors from './publishInvoiceConfirmed.errors';

type Context = AuthorizationContext<Roles>;
export type PublishInvoiceConfirmedContext = Context;

const INVOICE_CONFIRMED = 'InvoiceConfirmed';

export class PublishInvoiceConfirmedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const validRequest = this.verifyInput(request);
    if (validRequest.isLeft()) {
      return validRequest;
    }

    const {
      messageTimestamp,
      billingAddress,
      invoiceItems,
      manuscript,
      invoice,
      payer,
    } = request;

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

  private verifyInput(
    request: DTO
  ): Either<
    | Errors.BillingAddressRequiredError
    | Errors.InvoiceItemsRequiredError
    | Errors.ManuscriptRequiredError
    | Errors.InvoiceRequiredError
    | Errors.PayerRequiredError,
    void
  > {
    if (!request.billingAddress) {
      return left(new Errors.BillingAddressRequiredError());
    }

    if (!request.invoice) {
      return left(new Errors.InvoiceRequiredError());
    }

    if (!request.invoiceItems) {
      return left(new Errors.InvoiceItemsRequiredError());
    }

    if (!request.manuscript) {
      return left(new Errors.ManuscriptRequiredError());
    }

    if (!request.payer) {
      return left(new Errors.PayerRequiredError());
    }

    return right(null);
  }
}
