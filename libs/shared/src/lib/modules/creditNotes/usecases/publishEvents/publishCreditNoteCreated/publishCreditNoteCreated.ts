// * Temporary naming until CreditNoteEvents exist in phenom!!!!
import { InvoiceCreditNoteCreated as CreditNoteCreatedEvent } from '@hindawi/phenom-events';
// *

import { Either, right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

//* Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { InvoiceItem } from '../../../../invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../../invoices/domain/Invoice';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';
import {
  formatCreditNoteCosts,
  formatInvoiceItems,
  formatPayer,
} from '../../../../invoices/usecases/publishEvents/eventFormatters';

import { PublishCreditNoteCreatedResponse as Response } from './publishCreditNoteCreatedResponse';
import { PublishCreditNoteCreatedDTO as DTO } from './publishCreditNoteCreatedDTO';
import * as Errors from './publishCreditNoteCreatedErrors';

const CREDIT_NOTE_CREATED = 'InvoiceCreditNoteCreated';

export class PublishCreditNoteCreatedUsecase
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
      billingAddress,
      invoiceItems,
      creditNote,
      manuscript,
      invoice,
      payer,
    } = request;

    const creditNoteItems = invoiceItems.map((item) => {
      const itemProps = Object.assign({}, item.props);

      itemProps.price = itemProps.price * -1;

      const maybeItem = InvoiceItem.create(itemProps, item.id);

      if (maybeItem.isLeft()) {
        return null;
      }

      return maybeItem.value;
    });

    const erpReference = creditNote.erpReference;
    const data: CreditNoteCreatedEvent = {
      ...EventUtils.createEventObject(),

      creditNoteForInvoice: creditNote.invoiceId.id.toString(),
      referenceNumber: creditNote.persistentReferenceNumber,
      transactionId: invoice.transactionId.toString(),
      erpReference: erpReference?.value ?? null,
      invoiceId: creditNote.id.toString(),
      invoiceStatus: InvoiceStatus.FINAL,
      isCreditNote: true,

      lastPaymentDate: null,
      invoiceFinalizedDate: creditNote?.dateIssued?.toISOString(),
      manuscriptAcceptedDate: invoice?.dateAccepted?.toISOString(),
      invoiceCreatedDate: creditNote?.dateCreated?.toISOString(),
      invoiceIssuedDate: creditNote?.dateIssued?.toISOString(),

      costs: formatCreditNoteCosts(invoiceItems, creditNote),

      invoiceItems: formatInvoiceItems(creditNoteItems, manuscript.customId),

      payer: formatPayer(payer, billingAddress),

      payments: [],

      preprintValue: manuscript.preprintValue,

      reason: creditNote.creationReason,
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
