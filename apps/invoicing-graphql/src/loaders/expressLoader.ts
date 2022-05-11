/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import corsMiddleware from 'cors';
import express from 'express';
import Keycloak from 'keycloak-connect';
import session from 'express-session';

import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';
import { left } from '../../../../libs/shared/src/lib/core/logic/Either';

import {
  Roles,
  isAuthorizationError,
} from '../../../../libs/shared/src/lib/domain/authorization';

import { PayPalProcessFinishedUsecase } from '../../../../libs/shared/src/lib/modules/payments/usecases/paypalProcessFinished';
import { GetInvoicePdfUsecase } from '../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoicePdf/getInvoicePdf';
import { GetRecentLogsUsecase } from '../../../../libs/shared/src/lib/modules/audit/usecases/getRecentLogs';
import { GetJournalListUsecase } from '../../../../libs/shared/src/lib/modules/journals/usecases/journals/getJournalList';
import { CatalogBulkUpdateUsecase } from '../../../../libs/shared/src/lib/modules/journals/usecases/catalogBulkUpdate';
import { AuditLogMap } from '../../../../libs/shared/src/lib/modules/audit/mappers/AuditLogMap';
import { CatalogMap } from '../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';

import { Parser } from 'json2csv';

import { Context } from '../builders';
import {
  PayPalWebhookResponse,
  PayPalPaymentCapture,
} from '../services/paypal/types/webhooks';

import { env } from '../env';
import moment from 'moment';
import multer from 'multer';
import * as csv from '@fast-csv/parse';

function extractRoles(req: any): Array<Roles> {
  return req.kauth.grant.access_token.content.resource_access[
    env.app.keycloakConfig.resource
  ].roles
    .map((role: string) => role.toUpperCase())
    .map((role: string) => Roles[role]);
}

function extractCaptureId(data: PayPalPaymentCapture): string {
  const orderLink = data.links.find(
    (link) =>
      link.href.indexOf('captures') > -1 && link.href.indexOf('refund') === -1
  );
  const linkPathSplitted = orderLink.href.split('/');
  const orderId = linkPathSplitted[linkPathSplitted.length - 1];
  return orderId;
}

function parseCsvToJson(path: string): Promise<Array<unknown>> {
  return new Promise((resolve, reject) => {
    const data = [];
    csv
      .parseFile(path, {
        headers: true,
        discardUnmappedColumns: true,
      })
      .on('error', reject)
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(data);
      });
  });
}

function configureKeycloak(app, memoryStore, graphqlPath) {
  const keycloakConfig = env.app.keycloakConfig;

  const keycloak = new Keycloak(
    {
      store: memoryStore,
    },
    keycloakConfig
  );

  // Protect the main route for all graphql services
  // Disable unauthenticated access
  app.use(
    // graphqlPath,
    keycloak.middleware()
  );

  return { keycloak };
}

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');

    const upload = multer({ dest: '/tmp' });

    const app = express();

    const memoryStore = new session.MemoryStore();

    app.use(
      session({
        secret: env.app.sessionSecret,
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
      })
    );

    const { keycloak } = configureKeycloak(app, memoryStore, env.graphql.route);
    settings.setData('keycloak', keycloak);

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

    app.get('/api/logs', keycloak.protect(), async (req, res) => {
      const { repos } = context;
      const authContext = { roles: extractRoles(req) };
      const usecase = new GetRecentLogsUsecase(repos.audit);

      const fields = [
        'id',
        'userAccount',
        'timestamp',
        'action',
        'entity',
        'item_reference',
        'target',
      ];
      const opts = { fields };
      const csvConverter = new Parser(opts);

      const listResponse = await usecase.execute(
        {
          pagination: { offset: 0, limit: 10 },
          filters: {
            startDate:
              moment(String(req.query.startDate)).format('YYYY-MM-D') ?? null,
            endDate:
              moment(String(req.query.endDate)).format('YYYY-MM-D') ?? null,
            download: req.query.download ?? 1,
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

      res.setHeader('Content-disposition', 'attachment; filename=logs.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
    });

    app.get('/api/apc', keycloak.protect(), async (req, res) => {
      const { repos } = context;
      const authContext = { roles: extractRoles(req) };

      const usecase = new GetJournalListUsecase(repos.catalog);

      const fields = [
        'journalId',
        'journalTitle',
        { label: 'journalCode', value: 'code' },
        { label: 'apc', value: 'amount' },
        'zeroPriced',
      ];
      const opts = { fields };
      const csvConverter = new Parser(opts);

      const listResponse = await usecase.execute(
        {
          pagination: { offset: 0 },
        },
        authContext
      );

      if (listResponse.isLeft()) {
        return left(listResponse.value);
      }

      const logs = listResponse.value.catalogItems.map(
        CatalogMap.toPersistence
      );

      const jsonData = JSON.parse(JSON.stringify(logs));
      const csv = csvConverter.parse(jsonData);

      res.setHeader('Content-disposition', 'attachment; filename=apc.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
    });

    app.post(
      '/api/apc/upload-csv',
      upload.single('file'),
      keycloak.protect([
        Roles.ADMIN,
        Roles.FINANCIAL_CONTROLLER,
        Roles.SUPER_ADMIN,
      ] as any),
      async (req: any, res) => {
        const {
          repos,
          services: { logger },
          auditLoggerServiceProvider,
        } = context;

        const authContext = { roles: extractRoles(req) };

        const auditLoggerService = auditLoggerServiceProvider({
          email: req.kauth.grant.access_token.content.email,
        });

        const usecase = new CatalogBulkUpdateUsecase(
          repos.catalog,
          auditLoggerService
        );

        if (!req.file) {
          return res.status(400).send('Please upload a file');
        }
        const jsonResult = await parseCsvToJson(req.file.path);
        const newPrices = jsonResult.map((row: any) => ({
          journalId: row?.journalId,
          amount: row?.apc,
        }));
        try {
          const updatedList = await usecase.execute(
            { catalogItems: newPrices },
            authContext
          );

          if (updatedList.isLeft()) {
            if (isAuthorizationError(updatedList.value)) {
              res.status(403);
              res.send(updatedList.value.message);
            }
            logger.error(
              `Error updating APC: ${updatedList.value.message}.`,
              updatedList.value
            );
            res.status(406).send(updatedList.value.message);
          } else {
            if (updatedList.value === 0) {
              res.status(204).send();
            }
            res.status(200).send();
          }
        } catch (err) {
          logger.error(
            `While handling APC Update event an error occurred {${err.message}}`
          );
          res.status(500).send();
        }
      }
    );

    // * Run application to listen on given port
    if (!env.isTest) {
      const server = app.listen(env.app.port);
      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', app);
  }
};
