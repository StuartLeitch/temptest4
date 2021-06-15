import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvalidPostalCode extends UseCaseError {
  constructor(postalCode: string) {
    super(
      `The postalCode {${postalCode}} is invalid, it needs to have 5 numbers.`
    );
  }
}
