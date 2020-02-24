import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPublisherDetailsByNameErrors {
  export class PublisherNotFoundError extends Result<UseCaseError> {
    constructor(name: string) {
      super(false, {
        message: `No Publisher found with name {${name}}`
      });
    }
  }
}
