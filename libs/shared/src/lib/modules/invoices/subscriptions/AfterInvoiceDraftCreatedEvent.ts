import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../domain/authorization';
import { InvoiceDraftCreated } from '../domain/events/invoiceDraftCreated';
import { InvoiceRepoContract } from '../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../manuscripts/repos';
import { WaiverRepoContract } from '../../waivers/repos';
import { CouponRepoContract } from '../../coupons/repos';
import { GetInvoiceDetailsUsecase } from '../usecases/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../usecases/getItemsForInvoice/getItemsForInvoice';
import { GetManuscriptByManuscriptIdUsecase } from '../../manuscripts/usecases/getManuscriptByManuscriptId/getManuscriptByManuscriptId';
import { PublishInvoiceDraftCreatedUseCase } from '../usecases/publishEvents/publishInvoiceDraftCreated';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.DOMAIN_EVENT_HANDLER],
};

export class AfterInvoiceDraftCreatedEvent
  implements HandleContract<InvoiceDraftCreated> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
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
        const result = await this.publishInvoiceDraftCreated.execute(
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
      console.log(
        `[AfterInvoiceDraftCreated]: Failed to execute onInvoiceDraftCreatedEvent subscription AfterInvoiceDraftCreated. Err: ${err}`
      );
    }
  }
}
