/* eslint-disable @typescript-eslint/no-unused-vars */

import { InvoiceCreditNoteCreated as InvoiceCreditNoteCreatedEvent } from '@hindawi/phenom-events';

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

const INVOICE_CREDITED = 'InvoiceCreditNoteCreated';

export class PublishInvoiceCreditedUsecase
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

    const {
      messageTimestamp,
      billingAddress,
      paymentMethods,
      invoiceItems,
      creditNote,
      manuscript,
      payments,
      payer,
      invoice
    } = request;

    const erpReference = creditNote
      .getErpReferences()
      .getItems()
      .filter((er) => er.vendor === 'netsuite' && er.attribute === 'creditNote')
      .find(Boolean);

    const data: InvoiceCreditNoteCreatedEvent = {
      ...EventUtils.createEventObject(),

      creditNoteForInvoice: creditNote.cancelledInvoiceReference,
      referenceNumber: `CN-${invoice.persistentReferenceNumber}` ?? null,
      transactionId: creditNote.transactionId.toString(),
      erpReference: erpReference?.value ?? null,
      invoiceId: creditNote.id.toString(),
      invoiceStatus: creditNote.status,
      isCreditNote: true,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: creditNote?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: creditNote?.dateAccepted?.toISOString(),
      invoiceCreatedDate: creditNote?.dateCreated?.toISOString(),
      invoiceIssuedDate: creditNote?.dateIssued?.toISOString(),

      costs: formatCosts(invoiceItems, payments, creditNote),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),

      payments: formatPayments(payments, paymentMethods),

      preprintValue: manuscript.preprintValue,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_CREDITED,
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
