import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class GetPaymentMethodsDbRequestError extends UseCaseError {
  constructor(err: Error) {
    super(
      `When requesting all the payment methods an error ocurred ${err.message}: ${err.stack}`
    );
  }
}
