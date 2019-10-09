import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';
import {InvoicePaidEvent} from '../domain/events/invoicePaidEvent';
import {InvoiceRepoContract} from '../repos/invoiceRepo';

export class AfterInvoicePaidEvent implements HandleContract<InvoicePaidEvent> {
  private invoiceRepo: InvoiceRepoContract;

  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoicePaidEvent.bind(this),
      InvoicePaidEvent.name
    );
  }

  private async onInvoicePaidEvent(event: InvoicePaidEvent): Promise<any> {
    // Get invoice from repo
    const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);

    if (invoice) {
      // Get all payers interested in this invoice
      // Craft and send 'Invoice paid!' email with invoice link included
    }
  }
}
