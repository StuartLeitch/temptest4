import express from 'express';
import {
  RecordPayPalPaymentUsecase,
  RecordPaymentUsecase,
  GetInvoicePdfUsecase,
  Roles
} from '@hindawi/shared';

import { Context } from '../context';
import { AuthMiddleware } from './middleware/auth';

export function makeExpressServer(context: Context) {
  const app = express();
  const auth = new AuthMiddleware(context);
  app.use(express.json());

  app.post('/api/checkout', async (req, res) => {
    const { checkoutService } = context;

    const payment = req.body;

    const transaction = await checkoutService.pay(payment);

    const useCase = new RecordPaymentUsecase(
      context.repos.payment,
      context.repos.invoice
    );

    const resultEither = await useCase.execute(transaction);

    if (resultEither.isLeft()) {
      console.log(resultEither.value.errorValue());
      return res.status(500);
    } else {
      return resultEither.value.getValue();
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
