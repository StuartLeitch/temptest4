import { ServiceError } from '../../../../core/logic/service-error';

export class UnexpectedError extends ServiceError {
  constructor(error: Error) {
    super(error.message, 'BraintreeService', error);
  }
}

export class UnsuccessfulSale extends ServiceError {
  constructor(message: string) {
    super(message, 'BraintreeService.createTransaction');
  }
}

export class UnsuccessfulTokenGeneration extends ServiceError {
  constructor(message: string) {
    super(message, 'BraintreeService.generateClientToken');
  }
}
