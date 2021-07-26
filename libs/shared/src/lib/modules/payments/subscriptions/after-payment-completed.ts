import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { Roles } from '../../users/domain/enums/Roles';

import { PaymentCompleted } from '../domain/events';

import { GetInvoiceDetailsUsecase } from '../../invoices/usecases/getInvoiceDetails';
import { InvoiceRepoContract } from '../../invoices/repos/invoiceRepo';

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
    const usecaseContext = { roles: [Roles.DOMAIN_EVENT_HANDLER] };
    const invoiceId = event.payment.invoiceId.toString();
    const paymentId = event.payment.paymentId;

    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    const maybeInvoice = await usecase.execute({ invoiceId }, usecaseContext);

    if (maybeInvoice.isLeft()) {
      this.logger.error(
        `While handling "PaymentCompleted" domain event an error ocurred`,
        maybeInvoice.value
      );
    } else {
      const invoice = maybeInvoice.value;

      invoice.paymentAdded(paymentId);

      if (event.isFinal) {
        invoice.markAsFinal();

        try {
          await this.invoiceRepo.update(invoice);

          this.logger.info(
            `[AfterPaymentCompleted]: Successfully executed onPaymentCompleted use case`
          );
        } catch (err) {
          this.logger.error(
            `While saving the invoice status an error ocurred`,
            err
          );
        }
      }

      DomainEvents.dispatchEventsForAggregate(invoice.id);
    }
  }
}
