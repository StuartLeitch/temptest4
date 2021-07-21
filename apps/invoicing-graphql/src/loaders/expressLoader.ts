/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import corsMiddleware from 'cors';
import express from 'express';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { Parser } from 'json2csv';
import fs from 'fs';
import http from 'http';

import {
  PayPalProcessFinishedUsecase,
  GetInvoicePdfUsecase,
  Roles,
  GetRecentInvoicesUsecase,
  InvoiceMap,
  left,
} from '@hindawi/shared';

import { Context } from '../builders';
import {
  PayPalWebhookResponse,
  PayPalPaymentCapture,
} from '../services/paypal/types/webhooks';

import { env } from '../env';

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

    app.get('/api/invoices/invoices-list', async (req, res) => {
      const {
        repos,
        services: { logger },
      } = context;
      const authContext = { roles: [Roles.ADMIN] };

      const usecase = new GetRecentInvoicesUsecase(repos.invoice);

      const fields = [
        'id',
        'status',
        'dateCreated',
        'dateIssued',
        'dateAccepted',
        'persistentReferenceNumber',
        'cancelledInvoiceReference',
      ];
      const opts = { fields };
      const csvConverter = new Parser(opts);

      const listResponse = await usecase.execute(
        {
          pagination: { offset: 10 },
          filters: {
            invoiceStatus: req.query.invoiceStatus
              ? [req.query.invoiceStatus]
              : [],
            transactionStatus: req.query.transactionStatus
              ? [req.query.transactionStatus]
              : [],
            referenceNumber: req.query.reference
              ? [req.query.referenceNumber]
              : [],
          },
        },
        authContext
      );

      if (listResponse.isLeft()) {
        return left(listResponse.value);
      }

      const invoices = listResponse.value;
      const getInvoices = async () =>
        Promise.all(
          invoices.invoices.map(async (invoiceDetails: any) => {
            return {
              ...InvoiceMap.toPersistence(invoiceDetails),
              invoiceId: invoiceDetails.id.toString(),
              dateCreated: invoiceDetails?.dateCreated?.toISOString(),
              dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
              dateIssued: invoiceDetails?.dateIssued?.toISOString(),
              referenceNumber: invoiceDetails?.persistentReferenceNumber,
            };
          })
        );

      const invoicesList = await getInvoices();

      const jsonData = JSON.parse(JSON.stringify(invoicesList));
      const csv = csvConverter.parse(jsonData);

      res.setHeader(
        'Content-disposition',
        'attachment; filename=test_invoices_list.csv'
      );
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
    });

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

    // Run application to listen on given port
    if (!env.isTest) {
      const server = app.listen(env.app.port);
      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', app);
  }
};
