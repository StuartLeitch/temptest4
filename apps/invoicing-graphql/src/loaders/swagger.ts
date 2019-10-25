import basicAuth from 'express-basic-auth';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import * as path from 'path';
import * as swaggerUi from 'swagger-ui-express';

import {environment} from '../environments/environment';
import {default as swaggerFile} from '../api/swagger.json';

export const swaggerLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && environment.swagger.enabled) {
    const expressApp = settings.getData('express_app');
    // const jsonPath = path.join(
    //   __dirname,
    //   '..',
    //   'src',
    //   environment.swagger.file
    // );
    // const swaggerFile = require(jsonPath);

    // Add npm infos to the swagger doc
    swaggerFile.info = {
      title: environment.app.name,
      description: environment.app.description,
      version: environment.app.version
    };

    swaggerFile.servers = [
      {
        url: `${environment.app.schema}://${environment.app.host}:${environment.app.port}${environment.app.routePrefix}`
      }
    ];

    expressApp.use(
      environment.swagger.route,
      environment.swagger.username
        ? basicAuth({
            users: {
              [`${environment.swagger.username}`]: environment.swagger.password
            },
            challenge: true
          })
        : (req, res, next) => next(),
      swaggerUi.serve,
      swaggerUi.setup(swaggerFile)
    );
  }
};
