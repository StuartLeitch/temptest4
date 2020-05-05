import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { InvoicePaidEvent } from '../domain/events/invoicePaid';

import { ArticleRepoContract } from '../../manuscripts/repos/articleRepo';
import { InvoiceItemRepoContract, InvoiceRepoContract } from '../repos';
import { PayerRepoContract } from '../../payers/repos/payerRepo';
import { CouponRepoContract } from '../../coupons/repos';
import { WaiverRepoContract } from '../../waivers/repos';

import { GetPayerDetailsByInvoiceIdUsecase } from '../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { PublishInvoicePaid } from '../usecases/PublishInvoicePaid';

export class AfterInvoicePaidEvent implements HandleContract<InvoicePaidEvent> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private payerRepo: PayerRepoContract,
    private publishInvoicePaid: PublishInvoicePaid,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onInvoicePaidEvent.bind(this),
      InvoicePaidEvent.name
    );
  }

  private async onInvoicePaidEvent(event: InvoicePaidEvent): Promise<any> {
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(event.invoiceId);
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

      const manuscript = await this.manuscriptRepo.findById(
        invoiceItems[0].manuscriptId
      );

      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      const paymentDetails = await this.invoiceRepo.getInvoicePaymentInfo(
        invoice.invoiceId
      );

      const payerUsecase = new GetPayerDetailsByInvoiceIdUsecase(
        this.payerRepo,
        this.loggerService
      );
      const maybePayerResponse = await payerUsecase.execute({
        invoiceId: invoice.id.toString(),
      });
      if (maybePayerResponse.isLeft()) {
        throw new Error(`No payer for invoice ${invoice.id.toString()} found`);
      }

      const payer = maybePayerResponse.value.getValue();

      this.publishInvoicePaid.execute(
        invoice,
        invoiceItems,
        manuscript,
        paymentDetails,
        payer
      );
      console.log(
        `[AfterInvoicePaid]: Successfully executed onInvoicePaidEvent use case InvoicePaidEvent`
      );
    } catch (err) {
      console.log(
        `[AfterInvoicePaid]: Failed to execute onInvoicePaidEvent use case InvoicePaidEvent. Err: ${err}`
      );
    }
  }
}
