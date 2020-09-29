import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceDraftDeleted } from '../domain/events/invoiceDraftDeleted';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PublishInvoiceDraftDueAmountUpdatedUseCase } from '../usecases/publishEvents/publishInvoiceDraftDueAmountUpdated';
export class AfterInvoiceDraftDueAmountUpdatedEvent
  implements HandleContract<InvoiceDraftDeleted> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceDraftDueAmountUpdated: PublishInvoiceDraftDueAmountUpdatedUseCase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onInvoiceDeletedEvent.bind(this),
      InvoiceDraftDeleted.name
    );
  }

  private async onInvoiceDeletedEvent(
    event: InvoiceDraftDeleted
  ): Promise<any> {
    //Get invoice data
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

      if (invoice.status === 'DRAFT') {
        const result = await this.publishInvoiceDraftDueAmountUpdated.execute({
          invoice,
          invoiceItems,
          manuscript,
        });

        if (result.isLeft()) {
          throw new Error(result.value.errorValue().message);
        }
      }
    } catch (err) {
      console.log(
        `[AfterInvoiceDeleted]: Failed to execute onInvoiceDraftCreatedEvent subscription AfterInvoiceSubmitted. Err: ${err}`
      );
    }
  }
}
