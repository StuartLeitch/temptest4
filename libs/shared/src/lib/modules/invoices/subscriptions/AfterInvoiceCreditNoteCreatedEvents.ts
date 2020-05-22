import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

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

import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { PublishInvoiceCredited } from '../usecases/publishEvents/publishInvoiceCredited';
import { GetPaymentMethodsUseCase } from '../../payments/usecases/getPaymentMethods';

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
    private publishInvoiceCredited: PublishInvoiceCredited,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoiceCreditNoteCreatedEvent.bind(this),
      InvoiceCreditNoteCreatedEvent.name
    );
  }

  private async onInvoiceCreditNoteCreatedEvent(
    event: InvoiceCreditNoteCreatedEvent
  ): Promise<any> {
    try {
      const creditNote = await this.invoiceRepo.getInvoiceById(
        event.creditNoteId
      );

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

        invoiceItems = invoiceItemsResult.value.getValue();
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );
      if (!manuscript) {
        throw new Error(
          `CreditNote ${creditNote.id} has no manuscripts associated.`
        );
      }

      let payer = await this.payerRepo.getPayerByInvoiceId(
        creditNote.invoiceId
      );
      if (!payer) {
        if (creditNote.cancelledInvoiceReference) {
          const invoiceId = InvoiceId.create(
            new UniqueEntityID(creditNote.cancelledInvoiceReference)
          ).getValue();
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

      const paymentMethodsUsecase = new GetPaymentMethodsUseCase(
        this.paymentMethodRepo,
        this.loggerService
      );
      const paymentMethods = await paymentMethodsUsecase.execute();

      if (paymentMethods.isLeft()) {
        throw new Error(
          `Payment methods could not be accessed: ${
            paymentMethods.value.errorValue().message
          }`
        );
      }

      const payments = await this.paymentRepo.getPaymentsByInvoiceId(
        creditNote.invoiceId
      );

      const billingAddress = await this.addressRepo.findById(
        payer.billingAddressId
      );

      this.publishInvoiceCredited.execute(
        paymentMethods.value.getValue(),
        invoiceItems,
        billingAddress,
        manuscript,
        payments,
        creditNote,
        payer
      );

      console.log(
        `[AfterInvoiceCreditNoteCreated]: Successfully executed onInvoiceCreditNoteCreatedEvent use case InvoiceCreditedEvent`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceCreditNoteCreated]: Failed to execute onInvoiceCreditNoteCreatedEvent use case InvoiceCreditedEvent. Err: ${err}`
      );
    }
  }
}
