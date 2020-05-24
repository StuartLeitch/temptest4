import { InvoiceCreditNoteCreated as InvoiceCreditNoteCreatedEvent } from '@hindawi/phenom-events';

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
  calculateLastPaymentDate,
  formatInvoiceItems,
  formatPayments,
  formatCosts,
  formatPayer,
} from '../eventFormatters';

import { PublishInvoiceCreditedResponse as Response } from './publishInvoiceCredited.response';
import { PublishInvoiceCreditedDTO as DTO } from './publishInvoiceCredited.dto';
import * as Errors from './publishInvoiceCredited.errors';

type Context = AuthorizationContext<Roles>;
export type PublishInvoiceCreditedContext = Context;

const INVOICE_CREDITED = 'InvoiceCreditNoteCreated';

export class PublishInvoiceCreditedUsecase
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
      paymentMethods,
      invoiceItems,
      creditNote,
      manuscript,
      payments,
      payer,
    } = request;

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

  private verifyInput(
    request: DTO
  ): Either<
    | Errors.BillingAddressRequiredError
    | Errors.PaymentMethodsRequiredError
    | Errors.InvoiceItemsRequiredError
    | Errors.CreditNoteRequiredError
    | Errors.ManuscriptRequiredError
    | Errors.PaymentsRequiredError
    | Errors.PayerRequiredError,
    void
  > {
    if (!request.billingAddress) {
      return left(new Errors.BillingAddressRequiredError());
    }

    if (!request.creditNote) {
      return left(new Errors.CreditNoteRequiredError());
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

    if (!request.paymentMethods) {
      return left(new Errors.PaymentMethodsRequiredError());
    }

    if (!request.payments) {
      return left(new Errors.PaymentsRequiredError());
    }

    return right(null);
  }
}
