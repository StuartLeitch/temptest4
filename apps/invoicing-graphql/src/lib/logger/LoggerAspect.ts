import { beforeMethod, Metadata } from 'aspect.js';

import { GetPaymentMethodsUseCase } from './../../../../../libs/shared/src/lib/modules/payments/usecases/getPaymentMethods/GetPaymentMethods';

import { Logger } from './logger';
const logger = new Logger('logger:aspect');

export class LoggerAspect {
  @beforeMethod({
    classes: [GetPaymentMethodsUseCase],
    methods: [GetPaymentMethodsUseCase.prototype.execute]
  })
  invokeBeforeMethod(meta: Metadata) {
    // meta.advisedMetadata == { bar: 42 }
    logger.info('usecaseExecute', {
      usecaseClassName: meta.className,
      usecaseMethodName: meta.method.name,
      ...meta.method.args
    });
  }
}
