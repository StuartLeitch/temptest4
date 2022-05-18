import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';

import { EmailService } from '../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../infrastructure/logging';

import { InvoiceMovedToPendingEvent as InvoiceMovedToPending } from '../domain/events/invoiceMovedToPending';

export class AfterInvoiceMovedToPending
  implements HandleContract<InvoiceMovedToPending>
{
  constructor(
    private loggerService: LoggerContract,
    private emailService: EmailService
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // * Register to the domain event
    DomainEvents.register(
      this.onPublishInvoiceFinalized.bind(this),
      InvoiceMovedToPending.name
    );
  }

  private async onPublishInvoiceFinalized(
    event: InvoiceMovedToPending
  ): Promise<void> {
    const { invoice, receiver, sender } = event;

    try {
      await this.emailService
        .createInvoicePendingNotification(invoice, receiver, sender)
        .sendEmail();
    } catch (err) {
      this.loggerService.error(
        `Error when sending pending email for invoice {${invoice.id.toString()}} ${err}`
      );
    }
  }
}
