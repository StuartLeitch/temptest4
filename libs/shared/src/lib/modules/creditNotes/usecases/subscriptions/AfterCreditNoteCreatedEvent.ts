import { HandleContract } from '../../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { NoOpUseCase } from '../../../../core/domain/NoOpUseCase';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../domain/authorization';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { CreditNoteCreated as CreditNoteCreatedEvent } from '../../domain/events/CreditNoteCreated';

import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';
import { PaymentMethodRepoContract } from '../../../payments/repos/paymentMethodRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../../payments/repos/paymentRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { PublishCreditNoteCreatedUsecase } from '../publishEvents/publishCreditNoteCreated/publishCreditNoteCreated';
import { PublishRevenueRecognitionReversalUsecase } from '../../../invoices/usecases/ERP/publishRevenueRecognitionReversal/publishRevenueRecognitionReversal';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetPaymentMethodsUseCase } from '../../../payments/usecases/getPaymentMethods';

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
      const creditNote = await this.creditNoteRepo.getCreditNoteById(
        event.creditNoteId
      );

      // * Get Invoice Id
      const invoiceId = creditNote.invoiceId;

      // * Get Invoice Items

      const invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const invoiceItemsResult = await getItemsUsecase.execute({
          invoiceId: creditNote.invoiceId.id.toString(),
        });

        if (invoiceItemsResult.isLeft()) {
          throw new Error(
            `CreditNote ${creditNote.id.toString()} has no related invoice items.`
          );
        }
        invoiceItems = invoiceItemsResult.value.getValue();
      }

      // * Get Manuscript details

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (!manuscript) {
        throw new Error(
          `CreditNote ${creditNote.id} has no associated manuscripts.`
        );
      }

      // * Get Payer details
      let payer = await this.payerRepo.getPayerByInvoiceId(
        creditNote.invoiceId
      );
      if (!payer) {
        if (creditNote.invoiceId.id.toString() === invoice.id.toString()) {
          payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
          if (!payer) {
            throw new Error(
              `Credit Note ${creditNote.id.toString()} has no payers.`
            );
          }
        } else {
          throw new Error(
            `Credit Note ${creditNote.id.toString()} has no payers.`
          );
        }
      }

      // * Get Payment methods details
      const paymentMethodsUsecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );

      const paymentMethods = await paymentMethodsUsecase.execute();

      if (paymentMethods.isLeft()) {
        throw new Error(
          `Payment methods could not be obtained: ${
            paymentMethods.value.errorValue().message
          }`
        );
      }

      // * Get Payments
      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        creditNote.invoiceId
      );

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      // * Get Invoice details
      const maybeInvoiceDetails = await getInvoiceDetails.execute(
        {
          invoiceId: invoiceId.id.toString(),
        },
        defaultContext
      );

      if (maybeInvoiceDetails.isLeft()) {
        throw new Error(
          `Couldn't find Invoice Values for ID: ${invoiceId.id.toString()}`
        );
      }

      const invoiceDetails = maybeInvoiceDetails.value.getValue();

      //* Run publish Credit Note created usecase
      const publishResult = await this.publishCreditNoteCreated.execute({
        paymentMethods: paymentMethods.value.getValue(),
        billingAddress,
        invoiceItems,
        creditNote,
        manuscript,
        payments,
        invoiceDetails,
        payer,
      });

      if (publishResult.isLeft()) {
        throw publishResult.value.errorValue();
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
          throw publishRevenueRecognitionReversal.value.message;
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
