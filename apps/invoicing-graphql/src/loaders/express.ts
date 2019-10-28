import {Application} from 'express';
import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import {createExpressServer} from 'routing-controllers';

// import { authorizationChecker } from '../auth/authorizationChecker';
// import { currentUserChecker } from '../auth/currentUserChecker';
import {environment} from '../environments/environment';

import {CheckoutController} from '../api/controllers/checkoutController';

import {MailController} from '../api/controllers/mailingController';

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const connection = settings.getData('connection');

    /**
     * We create a new express server instance.
     * We could have also use useExpressServer here to attach controllers to an existing express instance.
     */
    const expressApp: Application = createExpressServer({
      cors: true,
      classTransformer: true,
      routePrefix: environment.app.routePrefix,
      defaultErrorHandler: false,
      /**
       * We can add options about how routing-controllers should configure itself.
       * Here we specify what controllers should be registered in our express server.
       */
      controllers: [CheckoutController, MailController]
      // controllers: environment.app.dirs.controllers
      // middlewares: environment.app.dirs.middlewares,
      // interceptors: environment.app.dirs.interceptors

      /**
       * Authorization features
       */
      // authorizationChecker: authorizationChecker(connection),
      // currentUserChecker: currentUserChecker(connection)
    });

    // Run application to listen on given port
    if (!environment.isTest) {
      const server = expressApp.listen(environment.app.port);
      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', expressApp);
  }
};
