import express, {response} from 'express';
import {Context} from '../context';
import {RecordPayment} from '@hindawi/shared';
import {AuthMiddleware} from './middleware/auth';

export function makeExpressServer(context: Context) {
  const app = express();
  const auth = new AuthMiddleware(context);

  app.post('/api/paypal-payment-completed', async (req, res) => {
    console.log('paypal payment created');
    console.log(req.body);
    return res.status(200).send('42');
  });

  app.post('/api/checkout', async (req, res) => {
    const {checkoutService} = context;

    const payment = req.body;

    const transaction = await checkoutService.pay(payment);

    const useCase = new RecordPayment(
      context.repos.payment,
      context.repos.invoice
    );

    try {
      return useCase.execute(transaction);
    } catch (err) {
      console.log(err);
      return res.status(500);
    }
  });

  app.get('/api/jwt-test', auth.enforce(), (req, res) => {
    res.status(200).json(req.auth);
  });

  app.get('/api/invoice/:invoiceId', async (req, res) => {
    const {invoicePdfService} = context;

    const eitherPdf = await invoicePdfService.getPdf(req.params.invoiceId);
    if (eitherPdf.isRight()) {
      const pdf = eitherPdf.value.getValue();

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${req.params.invoiceId}.pdf`,
        'Content-Length': pdf.length
      });
      res.end(pdf);
    } else {
      return res.status(400).send(eitherPdf.value);
    }
  });

  return app;
}
