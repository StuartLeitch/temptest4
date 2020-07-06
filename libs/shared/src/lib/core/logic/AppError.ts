import { Result } from './Result';
import { UseCaseError } from './UseCaseError';

export namespace AppError {
  export class UnexpectedError extends Result<UseCaseError> {
    private _message: string;

    get message(): string {
      return this._message;
    }

    public constructor(err: any, message?: string) {
      const msg = message ?? `An unexpected error occurred.`;

      super(false, {
        message: msg,
        err,
      } as UseCaseError);
      // console.log(`[AppError]: ${msg}`);
      // console.error(err);
      this._message = msg;
    }

    public static create(err: Error, message?: string): UnexpectedError {
      return new UnexpectedError(err, message);
    }
  }
}
