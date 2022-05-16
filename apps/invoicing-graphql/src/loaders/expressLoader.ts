import KeycloakConnect, { Keycloak, Token } from 'keycloak-connect';
import express, { Express, Request } from 'express';
import session, { Store } from 'express-session';
import * as csv from '@fast-csv/parse';
import memorystore from 'memorystore';
import corsMiddleware from 'cors';
import { Parser } from 'json2csv';
import moment from 'moment';
import multer from 'multer';

import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import {
  PayPalProcessFinishedUsecase,
  CatalogBulkUpdateUsecase,
  GetJournalListUsecase,
  GetInvoicePdfUsecase,
  GetRecentLogsUsecase,
  isAuthorizationError,
  AuditLogMap,
  CatalogMap,
  Roles,
  left,
} from '@hindawi/shared';

import {
  PayPalWebhookResponse,
  PayPalPaymentCapture,
} from '../services/paypal/types/webhooks';
import { Context } from '../builders';
import { env } from '../env';

type JournalJson = {
  journalId?: string;
  apc?: string;
};

function extractRoles(req: Request): Array<Roles> {
  return (<any>req).kauth.grant.access_token.content.resource_access[
    env.app.keycloakConfig.resource
  ].roles
    .map((role: string) => role.toUpperCase())
    .map((role: string) => Roles[role]);
}

function extractEmail(req: Request): string {
  return (<any>req).kauth.grant.access_token.content.email;
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

function parseCsvToJson<T>(path: string): Promise<Array<T>> {
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

function configureKeycloak(app: Express, memoryStore: Store): Keycloak {
  const keycloakConfig = env.app.keycloakConfig;

  const keycloak = new KeycloakConnect(
    {
      store: memoryStore,
    },
    keycloakConfig
  );

  // Protect the main route for all graphql services
  // Disable unauthenticated access
  app.use(keycloak.middleware());

  return keycloak;
}

function protectMultiRole(...roles: Array<string>) {
  return (token: Token) => {
    const resp = roles
      .map((role) => role.toLowerCase())
      .map(token.hasRole, token)
      .reduce((acc, r) => acc || r, false);

    return resp;
  };
}

function getStore(maxAge: number) {
  const MemoryStore = memorystore(session);

  return new MemoryStore({
    checkPeriod: maxAge,
  });
}

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');

    const upload = multer({ dest: '/tmp' });

    const app = express();

    const maxAge = 1000 * 60 * 60 * 8;
    const store = getStore(maxAge);

    app.use(
      session({
        secret: env.app.sessionSecret,
        resave: false,
        saveUninitialized: true,
        store: store,
        cookie: { maxAge },
      })
    );

    const keycloak = configureKeycloak(app, store);
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
      keycloak.protect(
        protectMultiRole(
          Roles.FINANCIAL_CONTROLLER,
          Roles.SUPER_ADMIN,
          Roles.ADMIN
        )
      ),
      async (req, res) => {
        const {
          repos,
          services: { logger },
          auditLoggerServiceProvider,
        } = context;

        const authContext = { roles: extractRoles(req) };

        const auditLoggerService = auditLoggerServiceProvider({
          email: extractEmail(req),
        });

        const usecase = new CatalogBulkUpdateUsecase(
          repos.catalog,
          auditLoggerService
        );

        if (!req.file) {
          return res.status(400).send('Please upload a file');
        }

        const jsonResult = await parseCsvToJson<JournalJson>(req.file.path);
        const newPrices = jsonResult.map((row) => ({
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
