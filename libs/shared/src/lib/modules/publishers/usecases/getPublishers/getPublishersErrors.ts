import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PublisherNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`Publisher if id {${id}} does not exist.`);
  }
}
