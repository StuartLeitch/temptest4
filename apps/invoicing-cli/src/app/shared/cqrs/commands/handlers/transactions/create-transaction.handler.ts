import { CreateTransactionCommand } from '../../impl/transactions/create-transaction.command'
import { CommandHandlerContract } from '../../../../../../../../../../../shared/lib/core/domain/commands/contracts/CommandHandler'
import { TransactionEntity } from '../../../../domain/transactions/Transaction'

export class CreateTransactionHandler
  implements CommandHandlerContract<CreateTransactionCommand> {
  constructor(
    private readonly transactionEntity: TransactionEntity // private readonly transactionRepository: TransactionRepository, // private readonly publisher: EventPublisher
  ) {}

  async execute(command: CreateTransactionCommand): Promise<TransactionEntity> {
    // Logger.log('Async CreateProjectHandler...', 'CreateProjectCommand')

    try {
      const { transaction } = command

      const temp = await this.transactionRepository.create(
        classToPlain(transaction)
      )
      const saved = await this.projectRepository.store(temp)
      const result = plainToClass(ProjectEntity, saved)
      const pub = this.publisher.mergeObjectContext(result)

      pub.notifyCreateProject(result)
      pub.commit()
      return result
    } catch (error) {
      // Logger.log(error, 'CreateProjectHandler')
    }
  }
}
