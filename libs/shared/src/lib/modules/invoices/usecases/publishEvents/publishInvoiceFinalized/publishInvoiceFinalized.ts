/* eslint-disable @typescript-eslint/no-unused-vars */

import { InvoiceFinalized as InvoiceFinalizedEvent } from '@hindawi/phenom-events';

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
import { Invoice } from '../../../domain/Invoice';

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
      paymentMethods,
      billingAddress,
      invoiceItems,
      manuscript,
      payments,
      invoice,
      payer,
    } = request;

    const data: InvoiceFinalizedEvent = {
      ...EventUtils.createEventObject(),

      referenceNumber: this.formatReferenceNumber(invoice),
      isCreditNote: !!invoice.cancelledInvoiceReference,
      transactionId: invoice.transactionId.toString(),
      erpReference: invoice.erpReference,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status,

      lastPaymentDate: calculateLastPaymentDate(payments)?.toISOString(),
      invoiceFinalizedDate: invoice?.dateMovedToFinal?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: invoice?.dateCreated?.toISOString(),
      invoiceIssuedDate: invoice?.dateIssued?.toISOString(),

      costs: formatCosts(invoiceItems, payments, invoice),

      invoiceItems: formatInvoiceItems(invoiceItems, manuscript.customId),

      payer: payer ? formatPayer(payer, billingAddress) : null,

      payments: payments ? formatPayments(payments, paymentMethods) : null,

      arxivId: manuscript.arxivId,
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

  private formatReferenceNumber(invoice: Invoice): string {
    if (!invoice.cancelledInvoiceReference) {
      return invoice.referenceNumber;
    } else {
      return `CN-${invoice.referenceNumber}`;
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
    // Commented the checks so that credit notes could be sent
    // if (!request.payer) {
    //   return left(new Errors.PayerRequiredError());
    // }

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

    // if (!request.payments) {
    //   return left(new Errors.PaymentsRequiredError());
    // }

    return right(null);
  }
}
