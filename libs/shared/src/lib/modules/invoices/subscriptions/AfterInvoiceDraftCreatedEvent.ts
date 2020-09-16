import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceDraftCreated } from '../domain/events/invoiceDraftCreated';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PublishInvoiceDraftCreatedUseCase } from '../usecases/publishEvents/publishInvoiceDraftCreated';

export class AfterInvoiceDraftCreatedEvent
  implements HandleContract<InvoiceDraftCreated> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceDraftCreated: PublishInvoiceDraftCreatedUseCase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onInvoiceDraftCreatedEvent.bind(this),
      InvoiceDraftCreated.name
    );
  }

  private async onInvoiceDraftCreatedEvent(
    event: InvoiceDraftCreated
  ): Promise<any> {
    //Get invoice data
    try {
      console.log('lets goooooooo');
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

      const result = await this.publishInvoiceDraftCreated.execute({
        invoice,
        invoiceItems,
        manuscript,
      });
      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }
    } catch (err) {
      console.log(
        `[AfterInvoiceSubmitted]: Failed to execute onInvoiceDraftCreatedEvent subscription AfterInvoiceSubmitted. Err: ${err}`
      );
    }
  }
}
