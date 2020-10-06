import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceDraftCreated } from '../domain/events/invoiceDraftCreated';
import { GetInvoiceDetailsUsecase } from '../usecases/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { GetManuscriptByManuscriptIdUsecase } from '../../manuscripts/usecases/getManuscriptByManuscriptId/getManuscriptByManuscriptId';
import { PublishInvoiceDraftCreatedUseCase } from '../usecases/publishEvents/publishInvoiceDraftCreated';

export class AfterInvoiceDraftCreatedEvent
  implements HandleContract<InvoiceDraftCreated> {
  constructor(
    private getInvoice: GetInvoiceDetailsUsecase,
    private getInvoiceItems: GetItemsForInvoiceUsecase,
    private getManuscript: GetManuscriptByManuscriptIdUsecase,
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
    const invoiceId = event.invoiceId.toString();
    try {
      const maybeInvoice = await this.getInvoice.execute({ invoiceId });
      if (!maybeInvoice || maybeInvoice.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} does not exist.`
        );
      }
      const invoice = maybeInvoice.value.getValue();

      const maybeInvoiceItems = await this.getInvoiceItems.execute({
        invoiceId,
      });
      if (!maybeInvoiceItems || maybeInvoiceItems.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no invoice items.`
        );
      }
      const invoiceItems = maybeInvoiceItems.value.getValue();

      const manuscriptId = invoiceItems[0].manuscriptId.toString();
      const maybeManuscript = await this.getManuscript.execute({
        manuscriptId,
      });
      if (!maybeManuscript || maybeManuscript.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no manuscripts associated.`
        );
      }
      const manuscript = maybeManuscript.value.getValue();

      if (invoice.status === 'DRAFT') {
        const result = await this.publishInvoiceDraftCreated.execute({
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
        `[AfterInvoiceDraftCreated]: Failed to execute onInvoiceDraftCreatedEvent subscription AfterInvoiceDraftCreated. Err: ${err}`
      );
    }
  }
}
