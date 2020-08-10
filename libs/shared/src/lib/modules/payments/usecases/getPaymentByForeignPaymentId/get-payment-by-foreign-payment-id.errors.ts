import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ForeignPaymentIdRequiredError extends UseCaseError {
  constructor() {
    super(`Foreign payment id is required`);
  }
}

export class DbCommunicationError extends UseCaseError {
  constructor(err: Error, id: string) {
    super(
      `While retrieving the payment with foreign payment id {${id}} and error ocurred: ${err.message}, with stack: ${err.stack}`
    );
  }
}
