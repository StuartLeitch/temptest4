import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PublisherNotFount extends UseCaseError {
  constructor(id: string) {
    super(`Publisher with id {${id}} not found`);
  }
}
