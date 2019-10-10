import {GluegunToolbox} from 'gluegun';

import {
  // CreateInvoiceUsecase,
  // Roles,
  ReductionFactory,
  Coupon,
  CouponMap,
  makeDb,
  destroyDb,
  KnexCouponRepo as CouponRepo
  // KnexTransactionRepo as TransactionRepo
} from '@hindawi/shared';

module.exports = {
  dashed: true,
  name: 'coupons',
  description: 'Coupons Management',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      print: {
        spin,
        // debug,
        success,
        newline,
        info,
        error,
        table,
        colors: {muted, blue}
      },
      prompt
    } = toolbox;
    //   // // if not, let's prompt the user for one and then assign that to `name`
    //   // if (!articleId) {
    info(blue('************************'));
    info(blue('*  Coupons Management  *'));
    info(blue('************************'));
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
    // const transactionRepo = new TransactionRepo(db);
    const couponRepo = new CouponRepo(db);
    const coupons = await couponRepo.getCouponCollection();
    const couponsData = coupons.map((c: Coupon) => CouponMap.toPersistence(c));

    buildTable(couponsData, table);

    newline();

    // const createInvoiceUsecase = new CreateInvoiceUsecase(
    //   invoiceRepo,
    //   transactionRepo
    // );
    // // * create spinner
    // const spinner = spin();
    // spinner.color = 'cyan';
    // spinner.start('Execute createInvoiceUsecase');
    // const result = await createInvoiceUsecase.execute(
    //   {
    //     transactionId
    //   },
    //   {
    //     roles: [Roles.ADMIN]
    //   }
    // );

    const {wantsToAddCoupon} = await prompt.ask([
      {
        type: 'confirm',
        name: 'wantsToAddCoupon',
        message: 'Do you want to create a new coupon?'
      }
      // {
      //   type: 'confirm',
      //   name: 'wantsToSplitTransaction',
      //   message: 'Do you want to split the transaction?'
      // }
    ]);

    if (wantsToAddCoupon) {
      newline();
      info(muted('Please enter Coupon details:'));

      const {name, reduction, valid} = await prompt.ask([
        {
          type: 'input',
          name: 'name',
          hint: ' (start typing)',
          message: 'Coupon Name'
        },
        {
          type: 'input',
          name: 'reduction',
          message: 'How much the reduction percentage?'
        },
        {
          type: 'confirm',
          name: 'valid',
          message: 'Is valid?'
        }
      ]);

      const newCoupon = ReductionFactory.createReduction('COUPON', {
        name,
        reduction,
        isValid: valid
      }) as Coupon;
      const savedCoupon = await couponRepo.save(newCoupon);

      const coupons = await couponRepo.getCouponCollection();
      const couponsData = coupons.map((c: Coupon) =>
        CouponMap.toPersistence(c)
      );

      console.info(couponsData);

      // buildTable(couponsData, table);

      newline();
    }

    await destroyDb(db);
    process.exit();

    // if (result.isSuccess) {
    //   const newlyCreatedInvoice = result.getValue();
    //   spinner.succeed('Successfully created a new invoice.');
    //   success(newlyCreatedInvoice);
    // } else {
    //   const {error: usecaseError} = result;
    //   spinner.fail(usecaseError.toString());
    //   error(usecaseError);
    // }
  }
};

function buildTable(data, tableRenderer) {
  const tableColumns = ['Coupon ID', 'Name', 'Is Valid?', 'Reduction'];

  const tableData = data.map(({id: couponID, name, valid, reduction}) => [
    couponID,
    name,
    valid ? 'Valid' : 'Invalid',
    parseFloat(String(reduction)).toFixed(2)
  ]);
  tableData.unshift(tableColumns);
  tableRenderer(tableData, {
    format: 'lean'
  });
}
