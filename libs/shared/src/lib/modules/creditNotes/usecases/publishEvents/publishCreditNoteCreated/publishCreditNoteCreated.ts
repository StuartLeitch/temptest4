// * Temporary naming until CreditNoteEvents exist in phenom!!!!
import { InvoiceCreditNoteCreated as CreditNoteCreatedEvent } from '@hindawi/phenom-events';
// *

import { Either, right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

//* Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';
import {
  calculateLastPaymentDate,
  formatInvoiceItems,
  formatPayments,
  formatCosts,
  formatPayer,
} from '../../../../invoices/usecases/publishEvents/eventFormatters';

import { PublishCreditNoteCreatedResponse as Response } from './publishCreditNoteCreatedResponse';
import { PublishCreditNoteCreatedDTO as DTO } from './publishCreditNoteCreatedDTO';
import * as Errors from './publishCreditNoteCreatedErrors';

const CREDIT_NOTE_CREATED = 'CreditNoteCreated';

export class PublishCreditNoteCreatedUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const validRequest = this.verifyInput(request);
    if (validRequest.isLeft()) {
      return validRequest;
    }

    const {
      payer,
      invoice,
      payments,
      manuscript,
      creditNote,
      invoiceItems,
      paymentMethods,
      billingAddress,
      messageTimestamp,
    } = request;

    const erpReference = creditNote.getErpReference();
    console.log(request.invoice);
    const data: CreditNoteCreatedEvent = {
      ...EventUtils.createEventObject(),

      creditNoteForInvoice: creditNote.invoiceId.id.toString(),
      referenceNumber: `CN-${creditNote.persistentReferenceNumber}` ?? null,
      transactionId: invoice.transactionId.toString(),
      erpReference: erpReference?.value ?? null,
      invoiceId: creditNote.invoiceId.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: true,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),

      reason: creditNote.creationReason,

      costs: formatCosts(invoiceItems, payments, invoice, creditNote),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),

      payments: formatPayments(payments, paymentMethods),

      preprintValue: manuscript.preprintValue,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: CREDIT_NOTE_CREATED,
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
    | Errors.BillingAddressRequiredError
    | Errors.PaymentMethodsRequiredError
    | Errors.InvoiceItemsRequiredError
    | Errors.CreditNoteRequiredError
    | Errors.ManuscriptRequiredError
    | Errors.PaymentsRequiredError
    | Errors.PayerRequiredError,
    void
  > {
    if (request.payer && !request.billingAddress) {
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

    if (!request.paymentMethods) {
      return left(new Errors.PaymentMethodsRequiredError());
    }

    return right(null);
  }
}
