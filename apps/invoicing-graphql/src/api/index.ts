import express from 'express';
import {Context} from '../context';
import {RecordPayment} from '@hindawi/shared';


export function makeExpressServer(context: Context) {
  const app = express();

  app.post('/api/paypal-payment-completed', async (req, res) => {
    console.log('paypal payment created');
    console.log(req.body);
    return res.status(200).send('42');
  });

  app.post('/api/checkout', async (req, res) =>  {
    const { checkoutService } = context;

    const payment = req.body;

    await checkoutService.pay(payment);

    const useCase = new RecordPayment(
      context.repos.payment,
      context.repos.invoice
    );

    const payload = {
      amount: 100,
      payerId: '123-123-124',
      invoiceId: '123-123-125',
      foreignPaymentId: '123-123-126',
      paymentMethod: '123-123-1237'
    };

    try {
      return useCase.execute(payload);
    } catch (err) {
      console.log(err);
      return res.status(500);
    }
  });

  return app;
}
