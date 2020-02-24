import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPublisherDetailsErrors {
  export class PublisherNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, { message: `Publisher if id {${id}} does not exist.` });
    }
  }
}
