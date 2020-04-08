import express from 'express';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { env } from '../env';
import { Logger } from '../lib/logger';
import { ReportingHandlers } from './handlerLoader';
import { Event } from 'libs/eve/src';
const logger = new Logger('express:loader');

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const handlers: ReportingHandlers = settings.getData('handlers');
    const app = express();

    app.use(express.json({ limit: '50mb' }));
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
