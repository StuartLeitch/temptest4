import {GluegunToolbox} from 'gluegun';

import {
  Roles,
  // Invoice,
  GetInvoiceDetailsUsecase,
  PaymentFactory,
  PaymentModel,
  PaymentStrategy,
  CreditCardPayment,
  CreditCard,
  BraintreeGateway,
  KnexInvoiceRepo as InvoiceRepo,
  makeDb,
  destroyDb
} from '@hindawi/shared';

module.exports = {
  dashed: true,
  name: 'pay-invoice',
  alias: ['pi'],
  description: 'Execute payment for a given Invoice ID',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      parameters,
      print: {
        spin,
        debug,
        // success,
        newline,
        // table,
        info,
        error,
        colors: {muted, blue}
      }
      //   prompt,
      //   createTransactionFlow
    } = toolbox;

    // let payPal = new PayPal();
    let creditCard = new CreditCard();

    const paymentFactory: PaymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(creditCard);
    const paymentMethod: PaymentModel = paymentFactory.create(
      'CreditCardPayment'
    );

    const paymentStrategy: PaymentStrategy = new PaymentStrategy([
      ['CreditCard', new CreditCardPayment(BraintreeGateway)]
    ]);

    info(blue('************************'));
    info(blue('*    Execute Payment   *'));
    info(blue('************************'));
    newline();

    const invoiceId = parameters.first;
    info(muted(`Invoice ID = ${invoiceId}`));

    const db = await makeDb({filename: './dev.sqlite3'});
    const invoiceRepo = new InvoiceRepo(db);
    const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(invoiceRepo);

    // * create spinner
    const spinner = spin();
    spinner.color = 'cyan';
    spinner.stop();

    const result = await getInvoiceDetailsUsecase.execute(
      {
        invoiceId
      },
      {
        roles: [Roles.ADMIN]
      }
    );

    // let invoice: Invoice
    if (result.isSuccess) {
      // let invoice = result.getValue()
      spinner.succeed('Successfully retrieved Invoice details.');
    } else {
      const {error: usecaseError} = result;
      spinner.fail(usecaseError.toString());
      error(usecaseError);
    }
    spinner.stopAndPersist();

    // const payment: any = await paymentStrategy.makePayment(paymentMethod, invoice.value)

    // if (payment.success) {
    //   success('Transaction ID: ' + payment.transaction.id)
    // } else {
    //   error(payment.message)
    // }

    await destroyDb(db);

    process.exit();
  }
};
