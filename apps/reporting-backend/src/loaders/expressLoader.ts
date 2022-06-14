import express, {RequestHandler} from 'express';
import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { env } from '../env';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/LoggerBuilder';
import { LogLevel } from 'libs/shared/src/lib/infrastructure/logging';
import { ReportingHandlers } from './handlerLoader';
import { Event } from 'libs/eve/src';
import express_prom_bundle from "express-prom-bundle";
import {register} from "prom-client";
const logger = new Logger(LogLevel.Info, 'express:loader');

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const handlers: ReportingHandlers = settings.getData('handlers');
    const app = express();

    const expressPrometheusMiddleware: RequestHandler = express_prom_bundle({
      buckets: [0.1, 0.4, 0.7, 1, 1.3, 2, 3],
      includeMethod: true,
      includePath: true,
      metricType: 'histogram',
      metricsPath: '/metrics',
      promRegistry: register,
      urlValueParser: {
        minHexLength: 5,
        extraMasks: [
          '^[0-9]+\\.[0-9]+\\.[0-9]+$' // replace dot-separated dates with #val
        ]
      },
    });

    app.use(expressPrometheusMiddleware);
    app.use(express.json({ limit: '50mb' }));

    app.get('/readyz', async (req, res) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send('{ready: true}');
    });

    app.get('/health', (_, res) => res.end());
    if (env.app.isRestEnabled) {
      app.put('/events', async (req, res) => {
        try {
          const events: Event[] = req.body;
          if (req.headers['x-auth-token'] !== env.app.restToken) {
            res.sendStatus(403);
            return;
          }
          await handlers.saveEventsHandler(events as any);
        } catch (error) {
          logger.error(error);
          res.sendStatus(400);
          return;
        }
        res.json({ ok: true, received: req.body.length });
      });
    }
    // Run application to listen on given port
    if (!env.isTest) {
      const server = app.listen(env.app.port);

      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', app);
  }
};
