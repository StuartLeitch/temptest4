import { CommandContract } from '../../../../command'
import { TransactionEntity } from '../../../../domain/transactions/Transaction'

export class CreateTransactionCommand implements CommandContract {
  constructor(public readonly transaction: TransactionEntity) {}
}
