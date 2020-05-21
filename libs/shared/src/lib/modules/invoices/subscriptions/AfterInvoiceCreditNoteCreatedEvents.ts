import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { InvoiceId } from './../domain/InvoiceId';
import { InvoiceCreditNoteCreated as InvoiceCreditNoteCreatedEvent } from '../domain/events/invoiceCreditNoteCreated';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos';
import { ArticleRepoContract } from '../../manuscripts/repos/articleRepo';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { PublishInvoiceCredited } from '../usecases/publishEvents/publishInvoiceCredited';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PayerRepoContract } from '../../payers/repos/payerRepo';

export class AfterInvoiceCreditNoteCreatedEvent
  implements HandleContract<InvoiceCreditNoteCreatedEvent> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private publishInvoiceCredited: PublishInvoiceCredited
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

      // const payer = await this.payerRepo.getPayerByInvoiceId(
      //   creditNote.invoiceId
      // );
      // if (!payer) {
      //   throw new Error(
      //     `Credit Note ${creditNote.id.toString()} has no payers.`
      //   );
      // }

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

      const address = await this.addressRepo.findById(payer.billingAddressId);

      this.publishInvoiceCredited.execute(
        creditNote,
        invoiceItems,
        manuscript,
        payer,
        address
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
