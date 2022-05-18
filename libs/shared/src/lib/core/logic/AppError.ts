import { UseCaseError } from './UseCaseError';

export class UnexpectedError extends UseCaseError {
  public constructor(message: string);
  public constructor(err: Error, message?: string);
  public constructor(errs: Array<Error>, message?: string);
  public constructor(errs: Error | Array<Error> | string, message?: string) {
    const msg = message ? `\nAdditional message to Error: ${message}` : '';

    if (Array.isArray(errs)) {
      super(
        `${errs.length} unexpected errors ocurred: \n${errs.map(
          (err, index) =>
            `Error ${index}: ${err.message}, with stack: ${err.stack}\n`
        )}${msg}`
      );
    } else if (errs instanceof Error) {
      super(
        `An unexpected error ocurred: ${errs.message}, with stack: ${errs.stack}${msg}`
      );
    } else {
      super(`An unexpected error ocurred: ${errs}, with stack: ${errs}${msg}`);
    }
  }

  public static create(err: Error, message?: string): UnexpectedError {
    return new UnexpectedError(err, message);
  }
}
