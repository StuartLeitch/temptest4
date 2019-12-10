import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoicePending } from '../domain/events/invoicePending';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PublishInvoiceCreatedUsecase } from '../usecases/publishInvoiceCreated/publishInvoiceCreated';

export class AfterInvoicePendingEvent
  implements HandleContract<InvoicePending> {
  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoicePendingEvent.bind(this),
      InvoicePending.name
    );
  }

  private async onInvoicePendingEvent(event: InvoicePending): Promise<any> {
    console.log(
      '------------------captured event of invoice set to pending. yay!!!!--------------'
    );
  }
}
