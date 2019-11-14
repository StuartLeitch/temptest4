import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';

import {InvoiceActivated} from '../domain/events/invoiceActivated';
import {PublishInvoiceGenerated} from '../usecases/publishInvoiceGenerated';

export class AfterInvoiceActivated implements HandleContract<InvoiceActivated> {
  constructor(private publishInvoiceGenerated: PublishInvoiceGenerated) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onPublishInvoiceGenerated.bind(this),
      InvoiceActivated.name
    );
  }

  private async onPublishInvoiceGenerated(
    event: InvoiceActivated
  ): Promise<void> {
    const {invoice} = event;

    try {
      await this.publishInvoiceGenerated.execute(invoice);
      console.log(
        `[AfterInvoiceActivated]: Successfully executed PublishInvoiceGenerated use case AfterInvoiceActivated`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceActivated]: Failed to execute PublishInvoiceGenerated use case AfterInvoiceActivated.`
      );
    }
  }
}
