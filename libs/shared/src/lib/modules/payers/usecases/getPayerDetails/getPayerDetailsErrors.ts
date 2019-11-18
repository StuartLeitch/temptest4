import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace GetPayerDetailsErrors {
  export class PayerNotFoundError extends Result<UseCaseError> {
    constructor(payerId: string) {
      super(false, {
        message: `Couldn't find a Payer with Payer id {${payerId}}.`
      } as UseCaseError);
    }
  }
}
