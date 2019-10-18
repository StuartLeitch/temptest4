import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace ValidateVATErrors {
  export class InvalidInputError extends Result<UseCaseError> {
    constructor(vatNumber: string, countryCode: string) {
      super(false, {
        message: `Invalid Input for {${vatNumber} or ${countryCode}}.`
      } as UseCaseError);
    }
  }
}
