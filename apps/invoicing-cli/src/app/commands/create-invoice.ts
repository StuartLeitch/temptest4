import {GluegunToolbox} from 'gluegun';

import {
  CreateInvoiceUsecase,
  Roles,
  makeDb,
  destroyDb,
  KnexInvoiceRepo as InvoiceRepo,
  KnexTransactionRepo as TransactionRepo
} from '@hindawi/shared';

module.exports = {
  dashed: true,
  name: 'create-invoice',
  alias: ['ci'],
  description: 'Creates an Invoice for a given Transaction ID',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      parameters,
      print: {
        spin,
        // debug,
        success,
        info,
        error,
        colors: {blue}
      }
      //   prompt,
      //   createTransactionFlow
    } = toolbox;
    //   // // if not, let's prompt the user for one and then assign that to `name`
    //   // if (!articleId) {
    info(blue('************************'));
    info(blue('*    Create Invoice    *'));
    info(blue('************************'));
    const transactionId = parameters.first;
    //   //   const result = await prompt.ask({
    //   //     type: 'input',
    //   //     name: 'articleId',
    //   //     initial: 'test-article-cli',
    //   //     message: 'Which article ID?'
    //   //   })
    //   //   if (result && result.articleId) articleId = result.articleId
    //   // }
    //   // // if they didn't provide one, we error out
    //   // if (!articleId) {
    //   //   error('No article ID specified!')
    //   //   return
    //   // }
    const db = await makeDb({filename: './dev.sqlite3'});
    const transactionRepo = new TransactionRepo(db);
    const invoiceRepo = new InvoiceRepo(db);
    const createInvoiceUsecase = new CreateInvoiceUsecase(
      invoiceRepo,
      transactionRepo
    );
    // * create spinner
    const spinner = spin();
    spinner.color = 'cyan';
    spinner.start('Execute createInvoiceUsecase');
    const result = await createInvoiceUsecase.execute(
      {
        transactionId
      },
      {
        roles: [Roles.ADMIN]
      }
    );

    await destroyDb(db);

    if (result.isSuccess) {
      const newlyCreatedInvoice = result.getValue();
      spinner.succeed('Successfully created a new invoice.');
      success(newlyCreatedInvoice);
    } else {
      const {error: usecaseError} = result;
      spinner.fail(usecaseError.toString());
      error(usecaseError);
    }
  }
};
