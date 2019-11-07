import {DomainEvents} from './../../../core/domain/events/DomainEvents';
import {HandleContract} from './../../../core/domain/events/contracts/Handle';
import {Invoice} from '../domain/Invoice';
import {CreateInvoiceUsecase} from '../usecases/createInvoice/createInvoice';
import {InvoiceCreated} from '../domain/events/invoiceCreated';

export class AfterInvoiceGenerated implements HandleContract<InvoiceCreated> {
  private createInvoice: CreateInvoiceUsecase;

  constructor(createInvoice: CreateInvoiceUsecase) {
    this.setupSubscriptions();
    this.createInvoice = createInvoice;
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onInvoiceGenerated.bind(this),
      InvoiceCreated.name
    );
  }

  private async onInvoiceGenerated(event: InvoiceCreated): Promise<void> {
    const {invoiceId} = event;

    try {
      await this.createInvoice.execute({
        // invoiceId: invoice.invoiceId.id.toString()
      });
      console.log(
        `[AfterInvoiceGenerated]: Successfully executed CreateInvoice use case AfterInvoiceGenerated`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceGenerated]: Failed to execute CreateInvoice use case AfterInvoiceGenerated.`
      );
    }
  }
}
