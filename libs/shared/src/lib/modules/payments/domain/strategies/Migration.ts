import { PaymentModel } from '../contracts/PaymentModel';

export class Migration implements PaymentModel {
  MIGRATION_PAYMENT = Symbol.for('@MigrationPayment');

  public getType(): symbol {
    return this.MIGRATION_PAYMENT;
  }
}
