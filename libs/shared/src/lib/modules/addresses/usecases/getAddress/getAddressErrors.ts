import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class AddressNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`The address with id {${id}} could not be found.`);
  }
}
