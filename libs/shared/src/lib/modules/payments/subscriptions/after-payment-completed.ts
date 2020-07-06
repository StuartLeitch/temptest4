import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { Roles } from '../../users/domain/enums/Roles';

import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { PaymentCompleted } from '../domain/events';

import { InvoiceRepoContract } from '../../invoices/repos/invoiceRepo';

import { GetInvoiceDetailsUsecase } from '../../invoices/usecases/getInvoiceDetails';

export class AfterPaymentCompleted implements HandleContract<PaymentCompleted> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private logger: LoggerContract
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.onPaymentCompleted.bind(this),
      PaymentCompleted.name
    );
  }

  private async onPaymentCompleted(event: PaymentCompleted): Promise<void> {
    const invoiceId = event.payment.invoiceId.toString();
    const usecaseContext = { roles: [Roles.EVENT_HANDLER] };

    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const maybeInvoice = await usecase.execute({ invoiceId }, usecaseContext);

    if (maybeInvoice.isLeft()) {
      this.logger.error(
        `While handling "PaymentCompleted" domain event an error ocurred`,
        maybeInvoice.value.errorValue
      );
    } else {
      const invoice = maybeInvoice.value.getValue();

      invoice.markAsFinal();

      try {
        await this.invoiceRepo.update(invoice);

        DomainEvents.dispatchEventsForAggregate(invoice.id);
      } catch (e) {
        this.logger.error(
          `While saving the invoice status an error ocurred`,
          e
        );
      }
    }
  }
}
