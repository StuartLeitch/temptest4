import {PaymentModel} from './PaymentModel';
import {PaymentGateway} from './PaymentGateway';

export abstract class PaymentService<
  T extends PaymentModel,
  G extends PaymentGateway
> {
  public appliesTo(provider: any): boolean {
    return `@${this.constructor.name}` === Symbol.keyFor(provider);
  }

  public abstract makePayment(model: PaymentModel, amount: number): void;
}
