import { UseCaseError } from './UseCaseError';
import ChainedError, {Options} from "typescript-chained-error";

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

enum ErrorCodes {
  VALIDATION_ERROR,
  GUARD_ERROR
}

/**
 * An error outside from outside the domain/application, like the network going down, an aws service error
 * (either configuration or api parameter related)
 */
export class RuntimeError extends ChainedError{
  constructor(message: string, cause: Error = new Error()) {
    super(message, cause);
  }
}

/**
 * An application error, from within our domain
 */
export class ApplicationError extends RuntimeError{
  constructor(public readonly errorCode:ErrorCodes, message: string = "", cause?: Error) {
    super(message, cause);
  }
}

export class GuardError extends ApplicationError{
  constructor(message: string, cause?: Error) {
    super(ErrorCodes.GUARD_ERROR, message, cause);
  }
}

export class ValidationError extends ApplicationError{
  constructor(message: string, cause?: Error) {
    super(ErrorCodes.VALIDATION_ERROR, message, cause);
  }
}

