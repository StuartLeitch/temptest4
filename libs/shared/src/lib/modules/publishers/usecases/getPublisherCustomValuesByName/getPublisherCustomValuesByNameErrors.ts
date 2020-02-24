import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPublisherCustomValuesByNameErrors {
  export class PublisherNotFound extends Result<UseCaseError> {
    constructor(name: string) {
      super(false, {
        message: `There is no Publisher with name {${name}}`
      });
    }
  }
}
