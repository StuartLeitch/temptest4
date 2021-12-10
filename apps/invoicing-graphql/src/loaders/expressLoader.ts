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
  GetRecentLogsUsecase,
  Roles,
  left,
  AuditLogMap
} from '@hindawi/shared';
import { Parser } from 'json2csv';

import { Context } from '../builders';
import {
  PayPalWebhookResponse,
  PayPalPaymentCapture,
} from '../services/paypal/types/webhooks';

import { env } from '../env';
import moment from 'moment';

function extractCaptureId(data: PayPalPaymentCapture): string {
  const orderLink = data.links.find(
    (link) =>
      link.href.indexOf('captures') > -1 && link.href.indexOf('refund') === -1
  );
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
      const {
        repos,
        services: { pdfGenerator, logger },
      } = context;
      const authContext = { roles: [Roles.PAYER] };

      const usecase = new GetInvoicePdfUsecase(
        repos.invoiceItem,
        repos.address,
        repos.manuscript,
        repos.invoice,
        repos.payer,
        repos.catalog,
        repos.coupon,
        repos.waiver,
        pdfGenerator,
        logger
      );

      const invoiceLink = req.headers.referer;
      const pdfEither = await usecase.execute(
        { payerId: req.params.payerId, invoiceLink },
        authContext
      );

      if (pdfEither.isLeft()) {
        return res.status(400).send(pdfEither.value.message);
      }

      const { fileName, file } = pdfEither.value;

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
      const payPalOrderId = extractCaptureId(data.resource);

      logger.info(
        `Try to handle PayPal webhook for transaction finished, for transaction with foreignPaymentId on ${payPalOrderId}`
      );

      try {
        const result = await usecase.execute(
          {
            payPalEvent: data.event_type,
            payPalOrderId,
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
          console.error(
            `Handling PayPal event finished with error ${
              result.value.message
            }. \nEvent had body {${JSON.stringify(req.body, null, 2)}}\n`,
            JSON.stringify(result.value, null, 2)
          );
          res.status(500);
        } else {
          res.status(200);
        }
      } catch (e) {
        logger.error(
          `While handling PayPal event an error ocurred {${
            e.message
          }}. \nEvent had body {${JSON.stringify(req.body, null, 2)}}`,
          e
        );
        console.error(
          `While handling PayPal event an error ocurred {${
            e.message
          }}. \nEvent had body {${JSON.stringify(req.body, null, 2)}}\n`,
          JSON.stringify(e, null, 2)
        );
        res.status(500);
      }

      res.send();
    });

    app.get('/api/logs', async (req, res) => {
      const {
        repos,
        services: { logger },
      } = context;
      const authContext = { roles: [Roles.ADMIN] };

      const usecase = new GetRecentLogsUsecase(repos.audit);

      const fields = [
        'id',
        'userAccount',
        'timestamp',
        'entity',
        'action',
        'item_reference',
        'target'
      ];
      const opts = { fields };
      const csvConverter = new Parser(opts);

      const listResponse = await usecase.execute(
        {
          pagination: { offset: 0, limit: 10 },
          filters: {
            startDate: moment(String(req.query.startDate)).format('YYYY-MM-D') ?? null,
            endDate: moment(String(req.query.endDate)).format('YYYY-MM-D') ?? null,
            download: req.query.download ?? 1
          },
        },
        authContext
      );

      if (listResponse.isLeft()) {
        return left(listResponse.value);
      }

      const logs = listResponse.value.auditLogs.map(AuditLogMap.toPersistence);

      const jsonData = JSON.parse(JSON.stringify(logs));
      const csv = csvConverter.parse(jsonData);

      res.setHeader(
        'Content-disposition',
        'attachment; filename=logs.csv'
      );
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
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
