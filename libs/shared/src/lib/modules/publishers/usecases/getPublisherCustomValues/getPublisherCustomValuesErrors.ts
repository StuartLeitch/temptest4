import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPublisherCustomValuesErrors {
  export class PublisherNotFount extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `Publisher with id {${id}} not found`
      });
    }
  }
}
