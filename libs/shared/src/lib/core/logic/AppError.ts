import { Result } from './Result';
import { UseCaseError } from './UseCaseError';

export class UnexpectedError extends Result<UseCaseError> {
  private _message: string;

  get message(): string {
    return this._message;
  }

  public constructor(err: any, message?: string) {
    const msg = message ?? `Error additional message: ${message}`;

    super(false, {
      message: `${msg} \n An unexpected error ocurred: ${err.message}, with stack: ${err.stack}`,
      err,
    } as UseCaseError);

    this._message = msg;
  }

  public static create(err: Error, message?: string): UnexpectedError {
    return new UnexpectedError(err, message);
  }
}
