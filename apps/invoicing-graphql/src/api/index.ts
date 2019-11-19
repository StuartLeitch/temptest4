import express from 'express';
import { Context } from '../context';
import {
  RecordPaymentUsecase,
  GetInvoicePdfUsecase,
  RecordPayPalPaymentUsecase,
  Roles
} from '@hindawi/shared';
import { AuthMiddleware } from './middleware/auth';

export function makeExpressServer(context: Context) {
  const app = express();
  const auth = new AuthMiddleware(context);
  app.use(express.json());

  app.post('/api/paypal-payment-completed', async (req, res) => {
    // const paymentAmount = req.body.resource.amount.value;
    // console.info(req.body);
    console.log('-----------------------------');
    // console.info(req.body.resource);
    console.log(JSON.stringify(req.body));
    // console.info(context.payPalService);

    // const usecase = new RecordPayPalPaymentUsecase(
    //   context.repos.paymentMethod,
    //   context.repos.payment,
    //   context.repos.invoice
    // );
    // usecase.execute(req.body);

    return res.status(200);
  });

  app.post('/api/paypal-payment/:payerId/:orderId', async (req, res) => {
    console.log('++++++++++++++++++++++++++++');
    console.info(req.params.payerId);
    console.info(req.params.orderId);
    console.log('++++++++++++++++++++++++++++');
  });

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
