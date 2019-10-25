import * as express from 'express';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import {environment} from '../environments/environment';

export const homeLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const expressApp = settings.getData('express_app');
    expressApp.get(
      environment.app.routePrefix,
      (req: express.Request, res: express.Response) => {
        return res.json({
          name: environment.app.name,
          version: environment.app.version,
          description: environment.app.description
        });
      }
    );
  }
};
