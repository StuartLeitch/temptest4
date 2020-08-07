import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ValidateVATErrors {
  export class InvalidInputError extends Result<UseCaseError> {
    constructor(vatNumber: string, countryCode: string) {
      super(false, {
        message: `Invalid Input for {${vatNumber} or ${countryCode}}.`,
      } as UseCaseError);
    }
  }
  export class ServiceUnavailableError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Service is currently unavailable`,
      } as UseCaseError);
    }
  }
}
