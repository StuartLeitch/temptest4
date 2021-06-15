import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PublisherNotFound extends UseCaseError {
  constructor(name: string) {
    super(`There is no Publisher with name {${name}}`);
  }
}
