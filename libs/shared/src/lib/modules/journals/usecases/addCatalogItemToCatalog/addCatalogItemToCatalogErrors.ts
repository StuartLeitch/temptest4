import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PublisherNotFoundError extends UseCaseError {
  constructor(publisherName: string) {
    super(`Couldn't find a Publisher for name {${publisherName}}.`);
  }
}
