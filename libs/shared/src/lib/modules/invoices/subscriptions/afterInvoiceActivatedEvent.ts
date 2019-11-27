import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';

import { InvoiceActivated } from '../domain/events/invoiceActivated';
import { PublishInvoiceConfirmed } from '../usecases/publishInvoiceConfirmed';

import { InvoiceItemRepoContract } from '../repos';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';

export class AfterInvoiceActivated implements HandleContract<InvoiceActivated> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceActivated: PublishInvoiceConfirmed
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onPublishInvoiceActivated.bind(this),
      InvoiceActivated.name
    );
  }

  private async onPublishInvoiceActivated(
    event: InvoiceActivated
  ): Promise<void> {
    try {
      const { invoice } = event;
      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        invoiceItems = await this.invoiceItemRepo.getItemsByInvoiceId(
          invoice.invoiceId
        );
      }

      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }

      const address = await this.addressRepo.findById(payer.billingAddressId);

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      await this.publishInvoiceActivated.execute(
        invoice,
        invoiceItems,
        manuscript,
        payer,
        address
      );
      console.log(
        `[AfterInvoiceActivated]: Successfully executed onPublishInvoiceActivated use case AfterInvoiceActivated`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceActivated]: Failed to execute onPublishInvoiceActivated use case AfterInvoiceActivated. Err: ${err}`
      );
    }
  }
}
