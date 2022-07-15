import { UsecaseAuthorizationContext, GetInvoiceDetailsUsecase, Invoice, Roles } from '@hindawi/shared';

import { EventHandlerHelpers } from '../helpers';
import { Context } from '../../../builders';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export class TAEventHandlerHelpers {
  constructor(private context: Context) {}

  getInvoiceDetails(context: Context) {
    return async (customId: string): Promise<Invoice> => {
      const { repos } = context;
      const eventHelpers = new EventHandlerHelpers(context);

      const invoiceId = await eventHelpers.getInvoiceId(customId);
      const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const maybeInvoice = await getInvoiceDetailsUsecase.execute(
        {
          invoiceId: invoiceId.id.toString(),
        },
        defaultContext
      );

      if (maybeInvoice.isLeft()) {
        throw maybeInvoice.value;
      }

      return maybeInvoice.value;
    };
  }
}
