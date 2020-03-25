import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';

import { InvoiceActivated } from '../domain/events/invoiceActivated';
import { PublishInvoiceConfirmed } from '../usecases/publishInvoiceConfirmed';

import { InvoiceItemRepoContract } from '../repos';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../addresses/repos/addressRepo';
import { PublishInvoiceToErpUsecase } from '../usecases/publishInvoiceToErp/publishInvoiceToErp';
// import { VATService, PayerType } from '@hindawi/shared';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';

export class AfterInvoiceActivated implements HandleContract<InvoiceActivated> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private publishInvoiceActivated: PublishInvoiceConfirmed,
    private invoiceToErpUsecase: PublishInvoiceToErpUsecase,
    private loggerService: any
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // * Register to the domain event
    DomainEvents.register(
      this.onPublishInvoiceActivated.bind(this),
      InvoiceActivated.name
    );
  }

  private async onPublishInvoiceActivated(
    event: InvoiceActivated
  ): Promise<void> {
    const { invoice } = event;

    try {
      // TODO move this to usecase
      let invoiceItems = invoice.invoiceItems.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute({
          invoiceId: invoice.invoiceId.id.toString(),
        });
        if (resp.isLeft()) {
          throw new Error(
            `Invoice ${invoice.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value.getValue();
      }

      const payer = await this.payerRepo.getPayerByInvoiceId(invoice.invoiceId);
      if (!payer) {
        throw new Error(`Invoice ${invoice.id.toString()} has no payers.`);
      }

      const address = await this.addressRepo.findById(payer.billingAddressId);

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(
          `Invoice ${invoice.id.toString()} has no manuscripts associated.`
        );
      }

      await this.publishInvoiceActivated.execute(
        invoice,
        invoiceItems,
        manuscript,
        payer,
        address
      );

      this.loggerService.info(
        `[AfterInvoiceActivated]: Successfully executed onPublishInvoiceActivated use case AfterInvoiceActivated`
      );
    } catch (err) {
      this.loggerService.info(
        `[AfterInvoiceActivated]: Failed to execute onPublishInvoiceActivated use case AfterInvoiceActivated. Err: ${err}`
      );
    }

    try {
      const resp = await this.invoiceToErpUsecase.execute({
        invoiceId: invoice.id.toString(),
      });
      if (resp.isLeft()) {
        throw resp.value;
      } else {
        this.loggerService.info(
          `[AfterInvoiceActivated]: Successfully executed invoiceToErpUsecase use case AfterInvoiceActivated`
        );
      }
    } catch (error) {
      this.loggerService.info(
        `[AfterInvoiceActivated]: Failed to execute invoiceToErpUsecase use case AfterInvoiceActivated. Err: ${error}`
      );
    }
  }
}
