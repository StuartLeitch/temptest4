import { Result } from './Result';
import { UseCaseError } from './UseCaseError';

export namespace AppError {
  export class UnexpectedError extends Result<UseCaseError> {
    public constructor(err: any, message?: string) {
      const msg = message ?? `An unexpected error occurred.`;
      super(false, {
        message: msg,
        err
      } as UseCaseError);
      // console.log(`[AppError]: ${msg}`);
      // console.error(err);
    }

    public static create(err: Error, message?: string): UnexpectedError {
      return new UnexpectedError(err, message);
    }
  }
}
