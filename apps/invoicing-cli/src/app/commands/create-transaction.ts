import { GluegunToolbox } from 'gluegun'

import { makeDb, destroyDb } from '@hindawi/server/testUtils/db'
import { Roles } from '@hindawi/shared'

import { CreateTransactionUsecase } from '../../../../../../../shared/lib/modules/transactions/usecases/createTransaction/createTransaction'

import { ArticleKnexRepo as ArticleRepo } from '../../../../../../server/src/repos/knex/ArticleRepo'
import { TransactionKnexRepo as TransactionRepo } from '../../../../../../server/src/repos/knex/TransactionRepo'

module.exports = {
  dashed: true,
  name: 'create-transaction',
  alias: ['ct'],
  description: 'Creates a Transaction for a given manuscript ID',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      parameters,
      print: {
        spin,
        // debug,
        success,
        //     info,
        error
        //     colors: { blue }
      }
      //   prompt,
      //   createTransactionFlow
    } = toolbox
    // // if not, let's prompt the user for one and then assign that to `name`
    // if (!articleId) {
    //   info(blue('************************'))
    //   info(blue('*  Create Transaction  *'))
    //   info(blue('************************'))
    //   const result = await prompt.ask({
    //     type: 'input',
    //     name: 'articleId',
    //     initial: 'test-article-cli',
    //     message: 'Which article ID?'
    //   })
    //   if (result && result.articleId) articleId = result.articleId
    // }
    // // if they didn't provide one, we error out
    // if (!articleId) {
    //   error('No article ID specified!')
    //   return
    // }

    const db = await makeDb({ filename: './dev.sqlite3' })
    const transactionRepo = new TransactionRepo(db)
    const articleRepo = new ArticleRepo(db)
    const createTransactionUsecase = new CreateTransactionUsecase(
      transactionRepo,
      articleRepo
    )

    // * create spinner
    const spinner = spin()
    spinner.color = 'cyan'

    const [
      articleId,
      journalId,
      title,
      articleTypeId,
      created
    ] = parameters.array

    spinner.start('Execute createTransactionUsecase')
    const result = await createTransactionUsecase.execute(
      {
        articleId,
        journalId,
        title,
        articleTypeId,
        created
      },
      {
        roles: [Roles.ADMIN]
      }
    )

    await destroyDb(db)

    if (result.isSuccess) {
      const newlyCreatedTransaction = result.getValue()
      spinner.succeed('Successfully created a new transaction.')
      success(newlyCreatedTransaction)
    } else {
      const { error: usecaseError } = result
      spinner.fail(usecaseError.toString())
      error(usecaseError)
    }
  }
}
