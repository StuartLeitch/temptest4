import * as express from 'express';

import {ControllerContract} from '../Controller';

export abstract class ExpressController extends ControllerContract<
  express.Request,
  express.Response
> {
  // or even private
  protected req: express.Request;
  protected res: express.Response;
}
