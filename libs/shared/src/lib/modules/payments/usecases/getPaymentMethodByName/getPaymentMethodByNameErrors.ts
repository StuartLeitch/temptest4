import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPaymentMethodByNameErrors {
  export class NoPaymentMethodFound extends Result<UseCaseError> {
    constructor(name: string) {
      super(false, {
        message: `No payment method with name {${name}} found.`
      });
    }
  }

  export class SearchNameMustNotBeEmpty extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: 'The provided search name should not be empty.'
      });
    }
  }
}
