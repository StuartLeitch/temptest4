import {PaymentModel} from '../contracts/PaymentModel';

export class PaymentFactory {
  payments = new Map();

  /**
   * All available gateways
   *
   * @return array An array of gateway names
   */
  public all() {
    return this.payments;
  }

  public registerPayment(pm: PaymentModel) {
    this.payments.set(pm.getType(), pm);
  }

  /**
   * Create a new payment instance
   *
   */
  public create(paymentType: string) {
    return this.payments.get(this.createSymbolOf(paymentType));
  }

  private createSymbolOf(value: string): symbol {
    return Symbol.for(`@${value}`);
  }
}
