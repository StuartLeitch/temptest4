import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace CreateAddressErrors {
  export class InvalidPostalCode extends Result<UseCaseError> {
    constructor(postalCode: string) {
      super(false, {
        message: `The postalCode {${postalCode}} is invalid, it needs to have 5 numbers.`
      });
    }
  }
}
