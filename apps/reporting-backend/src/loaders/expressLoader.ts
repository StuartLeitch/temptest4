import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import express from 'express';

import { env } from '../env';

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const app = express();
    // const auth = new AuthMiddleware(context);
    app.use(express.json());

    // Run application to listen on given port
    if (!env.isTest) {
      const server = app.listen(env.app.port);
      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', app);
  }
};
