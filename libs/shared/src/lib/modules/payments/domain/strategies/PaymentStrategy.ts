import {PaymentGateway} from '../contracts/PaymentGateway';
import {PaymentService} from '../contracts/PaymentService';
import {PaymentStrategyContract} from '../contracts/PaymentStrategy';
import {PaymentModel} from '../contracts/PaymentModel';

export class PaymentStrategy implements PaymentStrategyContract {
  private paymentServices: Map<
    string,
    PaymentService<PaymentModel, PaymentGateway>
  >;

  public constructor(paymentServices: any) {
    if (paymentServices === null) {
      throw new Error(typeof paymentServices);
    }
    this.paymentServices = new Map(paymentServices);
  }

  public async makePayment(
    model: PaymentModel,
    amount: number = 0
  ): Promise<unknown> {
    return this.getPaymentService(model).makePayment(model, amount);
  }

  private getPaymentService(
    model: PaymentModel
  ): PaymentService<PaymentModel, PaymentGateway> {
    const [result] = Array.from(this.paymentServices.values()).filter(p => {
      return p.appliesTo(model.getType());
    });

    if (result === null) {
      throw new Error(
        `Payment service for ${model.getType().toString()} not registered.`
      );
    }

    return result;
  }
}
