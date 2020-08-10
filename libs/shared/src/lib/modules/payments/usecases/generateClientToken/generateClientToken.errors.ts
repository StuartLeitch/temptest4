import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ClientTokenNotGenerated extends UseCaseError {
  constructor(err: Error) {
    super(
      `The Client Token was not successfully generated due to error {${err.message}}, with stack: ${err.stack}.`
    );
  }
}
