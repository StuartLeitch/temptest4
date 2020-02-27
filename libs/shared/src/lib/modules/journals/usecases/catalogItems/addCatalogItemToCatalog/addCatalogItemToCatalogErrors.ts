import { UseCaseError } from '../../../../../core/logic/UseCaseError';
import { Result } from '../../../../../core/logic/Result';

export namespace AddCatalogItemToCatalogErrors {
  export class PublisherNotFoundError extends Result<UseCaseError> {
    constructor(publisherName: string) {
      super(false, {
        message: `Couldn't find a Publisher for name {${publisherName}}.`
      } as UseCaseError);
    }
  }
}
