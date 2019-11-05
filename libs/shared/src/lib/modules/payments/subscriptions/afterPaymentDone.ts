import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';

import {PaymentDone} from '../domain/events/paymentDone';
import {CreatePaymentUsecase} from '../usecases/createPayment/CreatePayment';

export class AfterPaymentDone implements HandleContract<PaymentDone> {
  constructor(private createPaymentUsecase: CreatePaymentUsecase) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(this.onPaymentDone.bind(this), PaymentDone.name);
  }

  private async onPaymentDone(event: PaymentDone): Promise<void> {
    // Get metadata about the payment from the payment service
    const {payment} = event;

    try {
      await this.createPaymentUsecase.execute({
        paymentId: payment.paymentId.id.toString()
      });
      console.log(
        `[AfterPaymentDone]: Successfully executed CreatePayment use case AfterPaymentDone`
      );
    } catch (err) {
      console.log(
        `[AfterPaymentDone]: Failed to execute CreatePayment use case AfterPaymentDone.`
      );
    }
  }
}
