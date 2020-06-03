import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class GetPaymentMethodsDbRequestError extends Result<UseCaseError> {
  constructor(err: Error) {
    super(false, {
      message: `When requesting all the payment methods an error ocurred ${err.message}: ${err.stack}`,
    });
  }
}
