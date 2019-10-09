import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';
import {InvoiceCreatedEvent} from '../domain/events/invoiceCreatedEvent';
import {InvoiceRepoContract} from '../repos/invoiceRepo';

export class AfterInvoiceEvent implements HandleContract<InvoiceCreatedEvent> {
  private invoiceRepo: InvoiceRepoContract;

  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoiceCreatedEvent.bind(this),
      InvoiceCreatedEvent.name
    );
  }

  private async onInvoiceCreatedEvent(
    event: InvoiceCreatedEvent
  ): Promise<any> {
    // Get invoice from repo
    const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);

    if (invoice) {
      // Get all payers interested in this invoice
      // for payer in payers
      // Craft and send 'You got an invoice!' email with invoice link included
    }
  }
}
