import {Result} from './Result';
import {UseCaseError} from './UseCaseError';

export namespace AppError {
  export class UnexpectedError extends Result<UseCaseError> {
    public constructor(message: string | any, err?: any) {
      const error = err ?? message;
      super(false, {
        message: typeof message == 'string' ? message : `An unexpected error occurred.`,
        error
      } as UseCaseError);
      console.log(`[AppError]: An unexpected error occurred`);
      console.error(error);
    }

    public static create(err: any): UnexpectedError {
      return new UnexpectedError(err);
    }
  }
}
