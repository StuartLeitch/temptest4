import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';

import { ManuscriptPublished } from '../domain/events/manuscriptPublished';
// import { PublishInvoiceConfirmed } from '../usecases/publishInvoiceConfirmed';

// import { InvoiceItemRepoContract } from '../repos';
import { ArticleRepoContract as ManuscriptRepoContract } from '../../manuscripts/repos';
// import { PayerRepoContract } from '../../payers/repos/payerRepo';
// import { AddressRepoContract } from '../../addresses/repos/addressRepo';
// import { PublishInvoiceToErpUsecase } from '../usecases/publishInvoiceToErp/publishInvoiceToErp';
// import { VATService, PayerType } from '@hindawi/shared';
// import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
// import { CouponRepoContract } from '../../coupons/repos';
// import { WaiverRepoContract } from '../../waivers/repos';

export class AfterManuscriptPublishedEvent
  implements HandleContract<ManuscriptPublished> {
  constructor(
    private logger: any,
    // private invoiceItemRepo: InvoiceItemRepoContract,
    // private couponRepo: CouponRepoContract,
    // private waiverRepo: WaiverRepoContract,
    // private payerRepo: PayerRepoContract,
    // private addressRepo: AddressRepoContract,
    private manuscriptRepo: ManuscriptRepoContract // private publishInvoiceActivated: PublishInvoiceConfirmed, // private invoiceToErpUsecase: PublishInvoiceToErpUsecase
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onManuscriptPublished.bind(this),
      ManuscriptPublished.name
    );
  }

  private async onManuscriptPublished(
    event: ManuscriptPublished
  ): Promise<void> {
    const { manuscript } = event;
    this.logger.info('AfterManuscriptPublishedEvent', event);

    // try {
    //   // TODO move this to usecase
    //   let invoiceItems = invoice.invoiceItems.currentItems;

    //   if (invoiceItems.length === 0) {
    //     let getItemsUsecase = new GetItemsForInvoiceUsecase(
    //       this.invoiceItemRepo,
    //       this.couponRepo,
    //       this.waiverRepo
    //     );

    //     const resp = await getItemsUsecase.execute({
    //       invoiceId: invoice.invoiceId.id.toString()
    //     });
    //     if (resp.isLeft()) {
    //       throw new Error(
    //         `Invoice ${invoice.id.toString()} has no invoice items.`
    //       );
    //     }

    //     invoiceItems = resp.value.getValue();
    //   }

    //   const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
    //   if (!payer) {
    //     throw new Error(`Invoice ${invoice.id.toString()} has no payers.`);
    //   }

    //   const address = await this.addressRepo.findById(payer.billingAddressId);

    //   const manuscript = await this.manuscriptRepo.findById(
    //     invoiceItems[0].manuscriptId
    //   );

    //   if (!manuscript) {
    //     throw new Error(
    //       `Invoice ${invoice.id.toString()} has no manuscripts associated.`
    //     );
    //   }

    //   await this.publishInvoiceActivated.execute(
    //     invoice,
    //     invoiceItems,
    //     manuscript,
    //     payer,
    //     address
    //   );

    //   console.log(
    //     `[AfterInvoiceActivated]: Successfully executed onPublishInvoiceActivated use case AfterInvoiceActivated`
    //   );
    // } catch (err) {
    //   console.log(
    //     `[AfterInvoiceActivated]: Failed to execute onPublishInvoiceActivated use case AfterInvoiceActivated. Err: ${err}`
    //   );
    // }

    // try {
    //   let resp = await this.invoiceToErpUsecase.execute({
    //     invoiceId: invoice.id.toString()
    //   });
    //   if (resp.isLeft()) {
    //     throw resp.value;
    //   } else {
    //     console.log(
    //       `[AfterInvoiceActivated]: Successfully executed invoiceToErpUsecase use case AfterInvoiceActivated`
    //     );
    //   }
    // } catch (error) {
    //   console.log(
    //     `[AfterInvoiceActivated]: Failed to execute invoiceToErpUsecase use case AfterInvoiceActivated. Err: ${error}`
    //   );
    // }
  }
}
