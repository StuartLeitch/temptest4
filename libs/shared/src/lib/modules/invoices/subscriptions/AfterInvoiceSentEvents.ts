// * Core Domain
import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceSentEvent } from '../domain/events/invoiceSent';

import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { EmailCommunicatorContract } from '../infrastructure/communication-channels/contracts/EmailCommunicatorContract';
import { SchedulerContract } from '../infrastructure/scheduler/contracts/SchedulerContract';

export class AfterInvoiceSentEvent implements HandleContract<InvoiceSentEvent> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private emailCommunicator: EmailCommunicatorContract,
    private scheduler: SchedulerContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.emailCommunicator = emailCommunicator;
    this.scheduler = scheduler;
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onInvoiceSentEvent.bind(this),
      InvoiceSentEvent.name
    );
  }

  private async onInvoiceSentEvent(event: InvoiceSentEvent): Promise<any> {
    // Get invoice from repo
    const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);

    if (invoice) {
      // Get all payers interested in this invoice
      // for payer in payers

      // Craft and send 'You got an invoice!' email with invoice link included
      this.emailCommunicator.sendEmail({ message: 'You got an invoice!' });

      // Schedule a reminder for the payer of this invoice
      this.scheduler.schedule({ action: 'reminder', timeout: 30 });
    }
  }
}
