import express, { response } from 'express';
import { RecordPayment, Roles, GetInvoicePdfUsecase } from '@hindawi/shared';

import { Context } from '../context';
import { AuthMiddleware } from './middleware/auth';

export function makeExpressServer(context: Context) {
  const app = express();
  const auth = new AuthMiddleware(context);

  app.post('/api/paypal-payment-completed', async (req, res) => {
    console.log('paypal payment created');
    console.log(req.body);
    return res.status(200).send('42');
  });

  app.post('/api/checkout', async (req, res) => {
    const { checkoutService } = context;

    const payment = req.body;

    const transaction = await checkoutService.pay(payment);

    // const useCase = new RecordPayment(
    //   context.repos.payment,
    //   context.repos.invoice
    // );

    try {
      // return useCase.execute(transaction);
    } catch (err) {
      console.log(err);
      return res.status(500);
    }
  });

  app.get('/api/jwt-test', auth.enforce(), (req, res) => {
    res.status(200).json(req.auth);
  });

  app.get('/api/invoice/:payerId', async (req, res) => {
    const { repos } = context;
    const authContext = { roles: [Roles.PAYER] };

    const usecase = new GetInvoicePdfUsecase(
      repos.invoiceItem,
      repos.address,
      repos.manuscript,
      repos.invoice,
      repos.payer
    );
    const pdfEither = await usecase.execute(
      { payerId: req.params.payerId },
      authContext
    );

    if (pdfEither.isLeft()) {
      return res.status(400).send(pdfEither.value.errorValue());
    } else {
      const { fileName, file } = pdfEither.value.getValue();
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': file.length
      });
      res.end(file);
    }
  });

  return app;
}
