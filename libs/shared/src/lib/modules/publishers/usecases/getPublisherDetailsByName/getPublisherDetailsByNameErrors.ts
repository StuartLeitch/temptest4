import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PublisherNotFoundError extends UseCaseError {
  constructor(name: string) {
    super(`No Publisher found with name {${name}}`);
  }
}
