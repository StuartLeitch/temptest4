import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { InvoiceCredited as InvoiceCreditedEvent } from '../domain/events/invoiceCredited';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos';
import {
  ArticleRepoContract,
  GetItemsForInvoiceUsecase
} from '@hindawi/shared';
import { PublishInvoiceCredited } from '../usecases/publishInvoiceCredited';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';

export class AfterInvoicePaidEvent
  implements HandleContract<InvoiceCreditedEvent> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceCredited: PublishInvoiceCredited
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoiceCreditedEvent.bind(this),
      InvoiceCreditedEvent.name
    );
  }

  private async onInvoiceCreditedEvent(
    event: InvoiceCreditedEvent
  ): Promise<any> {
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);
      // let invoiceItems = invoice.invoiceItems.currentItems;
      // if (invoiceItems.length === 0) {
      //   const getItemsUsecase = new GetItemsForInvoiceUsecase(
      //     this.invoiceItemRepo,
      //     this.couponRepo,
      //     this.waiverRepo
      //   );

      //   const resp = await getItemsUsecase.execute({
      //     invoiceId: invoice.invoiceId.id.toString()
      //   });
      //   if (resp.isLeft()) {
      //     throw new Error(
      //       `Invoice ${invoice.id.toString()} has no invoice items.`
      //     );
      //   }

      //   invoiceItems = resp.value.getValue();
      // }
      // const manuscript = await this.manuscriptRepo.findById(
      //   invoiceItems[0].manuscriptId
      // );
      // if (!manuscript) {
      //   throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      // }

      // const paymentDetails = await this.invoiceRepo.getInvoicePaymentInfo(
      //   invoice.invoiceId
      // );

      this.publishInvoiceCredited.execute(
        invoice
        // invoiceItems,
        // manuscript,
        // paymentDetails
      );
      console.log(
        `[AfterInvoiceCredited]: Successfully executed onInvoiceCreditedEvent use case InvoiceCreditedEvent`
      );
    } catch (err) {
      console.log(
        `[AfterInvoiceCredited]: Failed to execute onInvoiceCreditedEvent use case InvoiceCreditedEvent. Err: ${err}`
      );
    }
  }
}
