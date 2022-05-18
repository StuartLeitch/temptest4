import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { Roles } from '../../../domain/authorization';
import { LoggerContract } from '../../../infrastructure/logging';

import { InvoiceDraftDueAmountUpdated } from '../domain/events/invoiceDraftDueAmountUpdated';

import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { WaiverRepoContract } from '../../waivers/repos';
import { CouponRepoContract } from '../../coupons/repos';

import { PublishInvoiceDraftDueAmountUpdatedUseCase } from '../usecases/publishEvents/publishInvoiceDraftDueAmountUpdated';
import { GetManuscriptByManuscriptIdUsecase } from '../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../usecases/getInvoiceDetails';

export class AfterInvoiceDraftDueAmountUpdatedEvent
  implements HandleContract<InvoiceDraftDueAmountUpdated>
{
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private publishInvoiceDraftDueAmountUpdated: PublishInvoiceDraftDueAmountUpdatedUseCase,
    private loggerService: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onInvoiceDraftDueAmountUpdatedEvent.bind(this),
      InvoiceDraftDueAmountUpdated.name
    );
  }

  private async onInvoiceDraftDueAmountUpdatedEvent(
    event: InvoiceDraftDueAmountUpdated
  ): Promise<any> {
    const defaultContext = {
      roles: [Roles.DOMAIN_EVENT_HANDLER],
    };
    //Get invoice data
    const invoiceId = event.invoiceId.id.toString();
    const getInvoice = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const getInvoiceItems = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const getManuscript = new GetManuscriptByManuscriptIdUsecase(
      this.manuscriptRepo
    );

    try {
      const maybeInvoice = await getInvoice.execute(
        { invoiceId },
        defaultContext
      );
      if (!maybeInvoice || maybeInvoice.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} does not exist.`
        );
      }
      const invoice = maybeInvoice.value;

      const maybeInvoiceItems = await getInvoiceItems.execute(
        {
          invoiceId,
        },
        defaultContext
      );
      if (!maybeInvoiceItems || maybeInvoiceItems.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no invoice items.`
        );
      }
      const invoiceItems = maybeInvoiceItems.value;

      const manuscriptId = invoiceItems[0].manuscriptId.id.toString();
      const maybeManuscript = await getManuscript.execute(
        {
          manuscriptId,
        },
        defaultContext
      );
      if (!maybeManuscript || maybeManuscript.isLeft()) {
        throw new Error(
          `Invoice ${event.invoiceId.id.toString()} has no manuscripts associated.`
        );
      }
      const manuscript = maybeManuscript.value;

      if (invoice.status === 'DRAFT') {
        const result = await this.publishInvoiceDraftDueAmountUpdated.execute(
          {
            invoice,
            invoiceItems,
            manuscript,
          },
          defaultContext
        );

        if (result.isLeft()) {
          throw new Error(result.value.message);
        }
      }
    } catch (err) {
      this.loggerService.error(
        `[AfterInvoiceDraftDueAmountUpdated]: Failed to execute onInvoiceDraftDueAmountUpdatedEvent subscription AfterInvoiceDraftDueAmountUpdatedEvent. Err: ${err}`
      );
    }
  }
}
