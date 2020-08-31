/* eslint-disable @typescript-eslint/no-unused-vars */

import { InvoicePaid as InvoicePaidEvent } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  Roles,
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

import { PublishInvoicePaidResponse as Response } from './publishInvoicePaid.response';
import { PublishInvoicePaidDTO as DTO } from './publishInvoicePaid.dto';
import * as Errors from './publishInvoicePaid.errors';

const INVOICE_PAID_EVENT = 'InvoicePaid';

export class PublishInvoicePaidUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private publishService: SQSPublishServiceContract) {}

  async execute(
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
      manuscript,
      payments,
      invoice,
      payer,
    } = request;

    const data: InvoicePaidEvent = {
      ...EventUtils.createEventObject(),

      referenceNumber: invoice.referenceNumber,
      transactionId: invoice.transactionId.toString(),
      erpReference: invoice.erpReference,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,
      isCreditNote: false,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated?.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),

      costs: formatCosts(invoiceItems, payments, invoice),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),

      payments: formatPayments(payments, paymentMethods),

      arxivId: manuscript.arxivId,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_PAID_EVENT,
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

    if (!request.paymentMethods) {
      return left(new Errors.PaymentMethodsRequiredError());
    }

    if (!request.payments) {
      return left(new Errors.PaymentsRequiredError());
    }

    return right(null);
  }
}
