import { NoOpUseCase } from '../../../core/domain/NoOpUseCase';
import { HandleContract } from '../../../core/domain/events/contracts/Handle';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { Roles } from '../../users/domain/enums/Roles';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

import { PaymentCompleted } from '../domain/events';
import { InvoiceRepoContract } from '../../invoices/repos/invoiceRepo';
import { GetInvoiceDetailsUsecase } from '../../invoices/usecases/getInvoiceDetails';
import { PublishPaymentToErpUsecase } from '../usecases/publishPaymentToErp/publishPaymentToErp';

export class AfterPaymentCompleted implements HandleContract<PaymentCompleted> {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private logger: LoggerContract,
    private publishPaymentToErp: PublishPaymentToErpUsecase | NoOpUseCase
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
    const usecaseContext = { roles: [Roles.EVENT_HANDLER] };
    const invoiceId = event.payment.invoiceId.toString();
    const paymentId = event.payment.paymentId;

    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    const maybeInvoice = await usecase.execute({ invoiceId }, usecaseContext);

    if (maybeInvoice.isLeft()) {
      this.logger.error(
        `While handling "PaymentCompleted" domain event an error ocurred`,
        maybeInvoice.value.errorValue
      );
    } else {
      const invoice = maybeInvoice.value.getValue();

      invoice.paymentAdded(paymentId);

      if (event.isFinal) {
        invoice.markAsFinal();

        try {
          await this.invoiceRepo.update(invoice);

          // const publishResult = await this.publishInvoiceConfirmed.execute({
          //   billingAddress,
          //   invoiceItems,
          //   manuscript,
          //   invoice,
          //   payer,
          // });

          // if (publishResult.isLeft()) {
          //   throw publishResult.value.errorValue();
          // }

          this.logger.info(
            `[AfterPaymentCompleted]: Successfully executed onPaymentCompleted use case`
          );
        } catch (e) {
          this.logger.error(
            `While saving the invoice status an error ocurred`,
            e
          );
        }
      }

      DomainEvents.dispatchEventsForAggregate(invoice.id);
    }
  }
}
