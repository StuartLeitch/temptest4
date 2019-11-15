import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace UpdatePayerErrors {
  export class PayerNotFoundError extends Result<UseCaseError> {
    constructor(payerId: string) {
      super(false, {
        message: `Couldn't find a Payer for id = {${payerId}}.`
      } as UseCaseError);
    }
  }
}
