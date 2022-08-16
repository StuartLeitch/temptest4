import { InvoiceFinalized as InvoiceFinalizedEvent } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

// * Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';

import {
  calculateLastPaymentDate,
  formatInvoiceItems,
  formatPayments,
  formatCosts,
  formatPayer,
} from '../eventFormatters';

import { PublishInvoiceFinalizedResponse as Response } from './publishInvoiceFinalized.response';
import { PublishInvoiceFinalizedDTO as DTO } from './publishInvoiceFinalized.dto';
import * as Errors from './publishInvoiceFinalized.errors';

const INVOICE_FINALIZED = 'InvoiceFinalized';

export class PublishInvoiceFinalizedUsecase
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const validRequest = this.verifyInput(request);

    if (validRequest.isLeft()) {
      return validRequest;
    }

    const {
      messageTimestamp,
      paymentMethods,
      billingAddress,
      invoiceItems,
      manuscript,
      payments,
      invoice,
      payer,
    } = request;

    const erpReference = invoice
      .getErpReferences()
      .getItems()
      .filter(
        (er) => er.vendor === 'netsuite' && er.attribute === 'confirmation'
      )
      .find(Boolean);

    const data: InvoiceFinalizedEvent = {
      ...EventUtils.createEventObject(),

      referenceNumber: invoice.persistentReferenceNumber,
      isCreditNote: false,
      transactionId: invoice.transactionId.toString(),
      erpReference: erpReference?.value ?? null,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated?.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),

      costs: formatCosts(invoiceItems, payments),
      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),
      payer: payer ? formatPayer(payer, billingAddress) : null,
      payments: payments ? formatPayments(payments, paymentMethods) : null,
      preprintValue: manuscript.preprintValue,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_FINALIZED,
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
    | Errors.ManuscriptRequiredError
    | Errors.PaymentsRequiredError
    | Errors.InvoiceRequiredError
    | Errors.PayerRequiredError,
    void
  > {
    if (!request.invoice) {
      return left(new Errors.InvoiceRequiredError());
    }

    if (!request.invoiceItems) {
      return left(new Errors.InvoiceItemsRequiredError());
    }

    if (!request.manuscript) {
      return left(new Errors.ManuscriptRequiredError());
    }

    if (request.payer && !request.billingAddress) {
      return left(new Errors.BillingAddressRequiredError());
    }

    if (!request.paymentMethods) {
      return left(new Errors.PaymentMethodsRequiredError());
    }

    return right(null);
  }
}
