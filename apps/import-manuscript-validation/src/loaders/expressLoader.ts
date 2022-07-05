import corsMiddleware from 'cors';
import express from 'express';

import { RequestHandler, Response } from 'express';

import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { Context } from '../builders';

import { env } from '../env';
import express_prom_bundle, {Opts, Labels}  from 'express-prom-bundle';
import { register } from 'prom-client'

export const expressLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
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
    app.use(express.json());
    app.use(corsMiddleware());

    app.get('/livez', async (req, res) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send('{live: true}');
    });

    app.get('/readyz', async (req, res) => {
      res.set('Content-Type', 'application/json');
      res.status(200).send('{ready: true}');
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
