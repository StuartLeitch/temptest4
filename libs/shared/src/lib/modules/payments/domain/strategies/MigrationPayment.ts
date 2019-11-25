import { Migration } from './Migration';
import { PaymentService } from '../contracts/PaymentService';

export class MigrationPayment extends PaymentService<
  Migration,
  { transaction: any }
> {
  public async makePayment(pm: Migration, amount: number): Promise<any> {
    console.log(`Registering payment ${amount} using Migration method`);
  }
}
