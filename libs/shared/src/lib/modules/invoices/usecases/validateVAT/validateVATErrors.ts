import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvalidInputError extends UseCaseError {
  constructor(vatNumber: string, countryCode: string) {
    super(`Invalid Input for {${vatNumber} or ${countryCode}}.`);
  }
}
export class ServiceUnavailableError extends UseCaseError {
  constructor() {
    super(`Service is currently unavailable`);
  }
}
