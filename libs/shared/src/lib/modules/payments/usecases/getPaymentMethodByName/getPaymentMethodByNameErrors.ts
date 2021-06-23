import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class NoPaymentMethodFound extends UseCaseError {
  constructor(name: string) {
    super(`No payment method with name {${name}} found.`);
  }
}

export class SearchNameMustNotBeEmpty extends UseCaseError {
  constructor() {
    super('The provided search name should not be empty.');
  }
}
