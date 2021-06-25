import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { NoOpUseCase } from '../../../core/domain/NoOpUseCase';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../domain/authorization';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { CreditNoteCreated as CreditNoteCreatedEvent } from '../domain/events/CreditNoteCreated';

import { CreditNoteRepoContract } from '../repos/creditNoteRepo';
import { PaymentMethodRepoContract } from '../../payments/repos/paymentMethodRepo';
import { ArticleRepoContract } from '../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../payments/repos/paymentRepo';
import { InvoiceItemRepoContract } from '../../invoices/repos/invoiceItemRepo';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../invoices/repos/invoiceRepo';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';

import { PublishCreditNoteCreatedUsecase } from '../usecases/publishEvents/publishCreditNoteCreated/publishCreditNoteCreated';
import { PublishRevenueRecognitionReversalUsecase } from '../../invoices/usecases/ERP/publishRevenueRecognitionReversal/publishRevenueRecognitionReversal';
import { GetInvoiceDetailsUsecase } from '../../invoices/usecases/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetPaymentMethodsUseCase } from '../../payments/usecases/getPaymentMethods';
import { left } from '../../../core/logic/Either';
import { UnexpectedError } from '../../../core/logic/AppError';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

export class AfterCreditNoteCreatedEvent
  implements HandleContract<CreditNoteCreatedEvent> {
  constructor(
    private creditNoteRepo: CreditNoteRepoContract,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private publishCreditNoteCreated:
      | PublishCreditNoteCreatedUsecase
      | NoOpUseCase,
    private publishRevenueRecognitionReversal: PublishRevenueRecognitionReversalUsecase,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onCreditNoteCreatedEvent.bind(this),
      CreditNoteCreatedEvent.name
    );
  }

  private async onCreditNoteCreatedEvent(
    event: CreditNoteCreatedEvent
  ): Promise<any> {
    const getInvoiceDetails = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    try {
      const maybeCreditNote = await this.creditNoteRepo.getCreditNoteByInvoiceId(
        event.invoiceId
      );
      if (maybeCreditNote.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCreditNote.value.message))
        );
      }

      const creditNote = maybeCreditNote.value;
      // * Get Invoice Id
      const invoiceId = creditNote.invoiceId;

      // * Get Invoice Items

      const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      if (maybeInvoice.isLeft()) {
        return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
      }

      const invoice = maybeInvoice.value;
      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const maybeInvoiceItemResult = await getItemsUsecase.execute({
          invoiceId: creditNote.invoiceId.id.toString(),
        });

        if (maybeInvoiceItemResult.isLeft()) {
          return left(
            new Error(
              `CreditNote ${creditNote.id.toString()} has no related invoice items.`
            )
          );
        }
        invoiceItems = maybeInvoiceItemResult.value;
      }

      // * Get Manuscript details

      const maybeManuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (maybeManuscript.isLeft()) {
        return left(
          new Error(
            `CreditNote ${creditNote.id} has no associated manuscripts.`
          )
        );
      }
      const manuscript = maybeManuscript.value;

      // * Get Payer details
      let maybePayer = await this.payerRepo.getPayerByInvoiceId(
        creditNote.invoiceId
      );

      if (maybePayer.isLeft()) {
        if (creditNote.invoiceId.id.toString() === invoice.id.toString()) {
          maybePayer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
          if (maybePayer.isLeft()) {
            return left(
              new Error(
                `Credit Note ${creditNote.id.toString()} has no payers.`
              )
            );
          }
        } else {
          return left(
            new Error(`Credit Note ${creditNote.id.toString()} has no payers.`)
          );
        }
      }
      const payer = maybePayer.value;

      // * Get Payment methods details
      const paymentMethodsUsecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );

      const maybePaymentMethods = await paymentMethodsUsecase.execute();

      if (maybePaymentMethods.isLeft()) {
        return left(
          new Error(
            `Payment methods could not be obtained: ${maybePaymentMethods.value.message}`
          )
        );
      }
      const paymentMethods = maybePaymentMethods.value;

      // * Get Payments
      const maybePayments = await this.paymentRepo.getPaymentsByInvoiceId(
        creditNote.invoiceId
      );
      if (maybePayments.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePayments.value.message))
        );
      }
      const payments = maybePayments.value;

      const maybeBillingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );
      if (maybeBillingAddress.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeBillingAddress.value.message))
        );
      }
      const billingAddress = maybeBillingAddress.value;

      // * Get Invoice details
      const maybeInvoiceDetails = await getInvoiceDetails.execute(
        {
          invoiceId: invoiceId.id.toString(),
        },
        defaultContext
      );

      if (maybeInvoiceDetails.isLeft()) {
        return left(
          new Error(
            `Couldn't find Invoice Values for ID: ${invoiceId.id.toString()}`
          )
        );
      }

      const invoiceDetails = maybeInvoiceDetails.value;

      //* Run publish Credit Note created usecase
      const publishResult = await this.publishCreditNoteCreated.execute({
        payer,
        invoice: invoiceDetails,
        payments,
        manuscript,
        creditNote,
        invoiceItems,
        paymentMethods,
        billingAddress,
      });

      if (publishResult.isLeft()) {
        return left(publishResult.value.message);
      }

      this.loggerService.info(
        `[AfterCreditNoteCreated]: Successfully executed onCreditNoteCreated event usecase.`
      );

      // * Find Netsuite revenue recognition entry for Invoice
      const nsRevRecReference = invoice
        .getErpReferences()
        .getItems()
        .filter(
          (er) =>
            er.vendor === 'netsuite' && er.attribute === 'revenueRecognition'
        )
        .find(Boolean);

      // * Publish Revenue recognition reversal
      if (manuscript.datePublished && nsRevRecReference) {
        const publishRevenueRecognitionReversal = await this.publishRevenueRecognitionReversal.execute(
          { invoiceId: invoiceId.id.toString() },
          defaultContext
        );

        if (publishRevenueRecognitionReversal.isLeft()) {
          return left(publishRevenueRecognitionReversal.value.message);
        }
        this.loggerService.info(
          `[PublishRevenueRecognitionReversal]: ${JSON.stringify(
            publishRevenueRecognitionReversal
          )}`
        );
      }
    } catch (err) {
      console.error(err);
      console.log(
        `[AfterCreditNoteCreated]: Failed to execute onCreditNoteCreatedEvent usecase. Err: ${err}`
      );
    }
  }
}
