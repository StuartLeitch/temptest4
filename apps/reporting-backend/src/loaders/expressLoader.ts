import express from 'express';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { env } from '../env';
import { Logger } from '../lib/logger';
import { ReportingHandlers } from './handlerLoader';
import { Event } from '@hindawi/eve';
const logger = new Logger('express:loader');

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const handlers: ReportingHandlers = settings.getData('handlers');
    const app = express();
    // const auth = new AuthMiddleware(context);
    app.use(express.json());

    app.get('/health', (_, res) => res.end());
    app.post('/events', async (req, res) => {
      try {
        await handlers.saveEventsHandler(req.body as Event[]);
      } catch (error) {
        logger.error(error);
        res.sendStatus(400);
        res.json({ ok: false, error: error });
      }
      res.json({ ok: true });
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
