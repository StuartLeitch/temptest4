import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { NoOpUseCase } from './../../../core/domain/NoOpUseCase';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../domain/authorization';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { InvoiceCreditNoteCreated as InvoiceCreditNoteCreatedEvent } from '../domain/events/invoiceCreditNoteCreated';

import { InvoiceId } from './../domain/InvoiceId';

import { PaymentMethodRepoContract } from '../../payments/repos/paymentMethodRepo';
import { ArticleRepoContract } from '../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../payments/repos/paymentRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';

import { PublishInvoiceCreditedUsecase } from '../usecases/publishEvents/publishInvoiceCredited';
import { PublishRevenueRecognitionReversalUsecase } from '../usecases/ERP/publishRevenueRecognitionReversal/publishRevenueRecognitionReversal';
import { GetInvoiceDetailsUsecase } from '../../invoices/usecases/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { GetPaymentMethodsUseCase } from '../../payments/usecases/getPaymentMethods';
import { Payer } from '../../payers/domain/Payer';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

export class AfterInvoiceCreditNoteCreatedEvent
  implements HandleContract<InvoiceCreditNoteCreatedEvent> {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private publishInvoiceCredited: PublishInvoiceCreditedUsecase | NoOpUseCase,
    private publishRevenueRecognitionReversal: PublishRevenueRecognitionReversalUsecase,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onInvoiceCreditNoteCreatedEvent.bind(this),
      InvoiceCreditNoteCreatedEvent.name
    );
  }

  private async onInvoiceCreditNoteCreatedEvent(
    event: InvoiceCreditNoteCreatedEvent
  ): Promise<any> {
    const getInvoiceDetails = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    try {
      const maybeCreditNote = await this.invoiceRepo.getInvoiceById(
        event.creditNoteId
      );

      if (maybeCreditNote.isLeft()) {
        throw new Error(`Credit note with id ${event.creditNoteId} not found.`);
      }

      const creditNote = maybeCreditNote.value;

      let invoiceItems = creditNote.invoiceItems.currentItems;
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
            `CreditNote ${creditNote.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = invoiceItemsResult.value;
      }

      const maybeManuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (maybeManuscript.isLeft()) {
        throw new Error(
          `CreditNote ${creditNote.id} has no manuscripts associated.`
        );
      }

      const manuscript = maybeManuscript.value;

      let maybePayer = await this.payerRepo.getPayerByInvoiceId(
        creditNote.invoiceId
      );
      let payer: Payer;

      if (maybePayer.isLeft()) {
        if (creditNote.cancelledInvoiceReference) {
          const invoiceId = InvoiceId.create(
            new UniqueEntityID(creditNote.cancelledInvoiceReference)
          );

          maybePayer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
          if (maybePayer.isLeft()) {
            throw new Error(
              `Credit Note ${creditNote.id.toString()} has no payers.`
            );
          } else {
            payer = maybePayer.value;
          }
        } else {
          throw new Error(
            `Credit Note ${creditNote.id.toString()} has no payers.`
          );
        }
      } else {
        payer = maybePayer.value;
      }

      const paymentMethodsUsecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );

      const paymentMethods = await paymentMethodsUsecase.execute();

      if (paymentMethods.isLeft()) {
        throw new Error(
          `Payment methods could not be accessed: ${paymentMethods.value.message}`
        );
      }

      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        creditNote.invoiceId
      );

      if (payments.isLeft()) {
        throw new Error(
          `Payments could not be accessed: ${payments.value.message}`
        );
      }

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      if (billingAddress.isLeft()) {
        throw new Error(
          `Billing address could not be accessed: ${billingAddress.value.message}`
        );
      }

      // * Get Invoice ID
      const invoiceId = creditNote.cancelledInvoiceReference;

      // * Get Invoice
      const maybeInvoice = await getInvoiceDetails.execute(
        {
          invoiceId,
        },
        defaultContext
      );

      if (maybeInvoice.isLeft()) {
        throw new Error(`Couldn't find Invoice Values for ID: ${invoiceId}`);
      }
      const invoice = maybeInvoice.value;

      const publishResult = await this.publishInvoiceCredited.execute({
        paymentMethods: paymentMethods.value,
        billingAddress: billingAddress.value,
        payments: payments.value,
        invoiceItems,
        creditNote,
        manuscript,
        invoice,
        payer,
      });

      if (publishResult.isLeft()) {
        throw publishResult.value;
      }

      this.loggerService.info(
        `[AfterInvoiceCreditNoteCreated]: Successfully executed onInvoiceCreditNoteCreatedEvent use case InvoiceCreditedEvent`
      );

      const nsRevRecReference = invoice
        .getErpReferences()
        .getItems()
        .filter(
          (er) =>
            er.vendor === 'netsuite' && er.attribute === 'revenueRecognition'
        )
        .find(Boolean);

      if (manuscript.datePublished && nsRevRecReference) {
        const publishRevenueRecognitionReversal = await this.publishRevenueRecognitionReversal.execute(
          { invoiceId },
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
        `[AfterInvoiceCreditNoteCreated]: Failed to execute onInvoiceCreditNoteCreatedEvent use case InvoiceCreditedEvent. Err: ${err}`
      );
    }
  }
}
