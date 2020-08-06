/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import corsMiddleware from 'cors';
import express from 'express';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import {
  PayPalProcessFinishedUsecase,
  GetInvoicePdfUsecase,
  Roles,
} from '@hindawi/shared';

import { Context } from '../builders';
import {
  PayPalWebhookResponse,
  PayPalPaymentCapture,
} from '../services/paypal/types/webhooks';

import { env } from '../env';

function extractOrderId(data: PayPalPaymentCapture): string {
  const orderLink = data.links.find((link) => link.href.indexOf('orders') > -1);
  const linkPathSplitted = orderLink.href.split('/');
  const orderId = linkPathSplitted[linkPathSplitted.length - 1];
  return orderId;
}

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
      // TODO: Add validation on event
      const data: PayPalWebhookResponse<PayPalPaymentCapture> = req.body;
      const {
        repos: { payment },
        services: { logger },
      } = context;
      const authContext = { roles: [Roles.PAYER] };
      const usecase = new PayPalProcessFinishedUsecase(payment);

      console.log('-------paypal event------');
      console.log(JSON.stringify(data, null, 2));
      console.log('-------------------------');

      try {
        const result = await usecase.execute(
          {
            payPalOrderId: extractOrderId(data.resource),
            payPalEvent: data.event_type,
          },
          authContext
        );

        if (result.isLeft()) {
          logger.error(
            `Handling PayPal event finished with error ${
              result.value.message
            }. \nEvent had body {${JSON.stringify(req.body, null, 2)}}`,
            result.value
          );
          return res.status(500);
        }
      } catch (e) {
        logger.error(
          `While handling PayPal event an error ocurred {${
            e.message
          }}. \nEvent had body {${JSON.stringify(req.body, null, 2)}}`,
          e
        );
        return res.status(500);
      }

      return res.status(200);
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
