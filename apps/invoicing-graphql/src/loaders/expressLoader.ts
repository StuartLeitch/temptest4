/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import corsMiddleware from 'cors';
import express from 'express';
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import {
  PayPalProcessFinishedUsecase,
  RecordPaymentUsecase,
  GetInvoicePdfUsecase,
  Roles,
  UniqueEntityID,
  InvoiceId,
} from '@hindawi/shared';

import { Context } from '../builders';

import { env } from '../env';

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');

    const app = express();

    app.use(express.json());
    app.use(corsMiddleware());

    app.get('/api/invoice/:payerId', async (req, res) => {
      const { repos } = context;
      const authContext = { roles: [Roles.PAYER] };

      const usecase = new GetInvoicePdfUsecase(
        repos.invoiceItem,
        repos.address,
        repos.manuscript,
        repos.invoice,
        repos.payer,
        repos.catalog,
        repos.coupon,
        repos.waiver
      );

      const invoiceLink = req.headers.referer;
      const pdfEither = await usecase.execute(
        { payerId: req.params.payerId, invoiceLink },
        authContext
      );

      if (pdfEither.isLeft()) {
        return res.status(400).send(pdfEither.value.errorValue());
      }

      const { fileName, file } = pdfEither.value.getValue();
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': file.length,
      });
      res.end(file);
    });

    app.post('/api/payments/process-finished', async (req, res) => {
      const {
        repos: { invoice, payment },
      } = context;
      const authContext = { roles: [Roles.PAYER] };
      const usecase = new PayPalProcessFinishedUsecase(invoice, payment);

      console.log('------------------------------');
      console.info(req.body);
      console.info(req.params);
      console.log('------------------------------');
    });

    // Run application to listen on given port
    if (!env.isTest) {
      const server = app.listen(env.app.port);
      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', app);
  }
};
