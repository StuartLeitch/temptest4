import { ServiceError } from '../../../../core/logic/service-error';

export class UnexpectedError extends ServiceError {
  constructor(error: Error) {
    super(error.message, 'PayPalService', error);
  }
}

export class UnsuccessfulOrderCreation extends ServiceError {
  constructor(message: string) {
    super(message, 'PayPalService.createOrder');
  }
}

export class UnsuccessfulOrderRetrieval extends ServiceError {
  constructor(message: string) {
    super(message, 'PayPal.getOrder');
  }
}
