import {GluegunToolbox} from 'gluegun';
import format from 'date-fns/format';

import {
  Transaction,
  TransactionMap,
  GetTransactionsUsecase,
  makeDb,
  destroyDb,
  KnexTransactionRepo as TransactionRepo
} from '@hindawi/shared';

module.exports = {
  dashed: true,
  name: 'edit-transaction',
  alias: ['et'],
  description: 'Edit Transaction Details',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      // parameters,
      system,
      print: {
        spin,
        // debug,
        // table,
        success,
        info,
        //   error
        colors: {blue}
      },
      prompt
      //   createTransactionFlow
    } = toolbox;

    // * create spinner
    const spinner = spin();
    spinner.color = 'cyan';
    // // if not, let's prompt the user for one and then assign that to `name`
    // if (!articleId) {
    info(blue('************************'));
    info(blue('*  Edit Transaction    *'));
    info(blue('************************'));
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

    const db = await makeDb({filename: './dev.sqlite3'});
    const transactionRepo = new TransactionRepo(db);
    // const articleRepo = new ArticleRepo(db)
    const getTransactionsUsecase = new GetTransactionsUsecase(transactionRepo);

    // const [
    //   articleId,
    //   journalId,
    //   title,
    //   articleTypeId,
    //   created
    // ] = parameters.array

    spinner.start('Execute getTransactionsUsecase');
    const result = await getTransactionsUsecase.execute({});

    let transactionChoices = [];
    if (result.isSuccess) {
      transactionChoices = result.getValue();
      spinner.succeed('Successfully retrieved transaction(s).');
      // success(newlyCreatedTransaction)
    } else {
      const {error: usecaseError} = result;
      spinner.fail(usecaseError.toString());
      // error(usecaseError)
    }

    spinner.stop();

    // debug(transactionChoices)
    const {
      transaction,
      transactionConfirmed,
      wantsToAddInvoice,
      wantsToSplitTransaction
    } = await prompt.ask([
      {
        type: 'select',
        name: 'transaction',
        message: 'Which transaction you wish to edit?',
        choices: transactionChoices.map((t: Transaction) => {
          const rawTransaction = TransactionMap.toPersistence(t);
          const {dateCreated, id} = rawTransaction;
          return {
            message: format(dateCreated, 'dd/MM/yyyy'),
            name: id,
            value: id
          };
        })
      },
      {
        type: 'confirm',
        name: 'transactionConfirmed',
        message: 'Are you sure?'
      },
      {
        type: 'confirm',
        name: 'wantsToAddInvoice',
        message: 'Do you want to create an invoice for this transaction?'
      },
      {
        type: 'confirm',
        name: 'wantsToSplitTransaction',
        message: 'Do you want to split the transaction?'
      }
    ]);

    let selectedTransactionId = '';
    if (transactionConfirmed) {
      selectedTransactionId = transaction;
    }

    if (wantsToAddInvoice) {
      // spinner.start('Creating invoice...')
      const createInvoiceCmd = `phenom create-invoice ${selectedTransactionId}`;
      const stdout = await system.run(createInvoiceCmd);
      info(stdout);
      success('New invoice created.');
    }

    if (wantsToSplitTransaction) {
      info(`Run command "phenom st ${selectedTransactionId}"`);
      // const splitTransactionCmd = `phenom split-transaction ${selectedTransactionId}`
      // const stdout = await system.run(createInvoiceCmd)
      // info(stdout)
    }

    await destroyDb(db);
  }
};
