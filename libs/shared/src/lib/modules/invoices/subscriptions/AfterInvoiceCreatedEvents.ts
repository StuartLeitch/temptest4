import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceCreated } from '../domain/events/invoiceCreated';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PublishInvoiceCreatedUsecase } from '../usecases/publishInvoiceCreated/publishInvoiceCreated';

export class AfterInvoiceCreatedEvent
  implements HandleContract<InvoiceCreated> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceCreated: PublishInvoiceCreatedUsecase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoiceCreatedEvent.bind(this),
      InvoiceCreated.name
    );
  }

  private async onInvoiceCreatedEvent(event: InvoiceCreated): Promise<any> {
    // Get invoice from repo
    console.log('execute OnInvoiceCreatedEvent');
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);
      if (!invoice) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} does not exist.`
        );
      }
      const invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
        event.invoiceId
      );
      if (!invoiceItems || invoiceItems.length === 0) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no invoice items.`
        );
      }

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no manuscripts associated.`
        );
      }

      const result = await this.publishInvoiceCreated.execute({
        invoice,
        invoiceItems,
        manuscript
      });

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      if (invoice) {
        // Get all payers interested in this invoice
        // for payer in payers
        // Craft and send 'You got an invoice!' email with invoice link included
      }
    } catch (err) {
      console.log(
        `[AfterInvoiceCreated]: Failed to execute onInvoiceCreatedEvent subscription AfterInvoiceCreated. Err: ${err}`
      );
    }
  }
}
