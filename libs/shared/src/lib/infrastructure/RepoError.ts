export enum RepoErrorCode {
  METHOD_NOT_IMPLEMENTED,
  ENTITY_NOT_FOUND,
  DB_ERROR,
}

export class RepoError extends Error {
  constructor(public code: RepoErrorCode, message: string) {
    super(message);

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, RepoError.prototype);
    }
  }

  static createEntityNotFoundError(name: string, id: string): RepoError {
    return new RepoError(
      RepoErrorCode.ENTITY_NOT_FOUND,
      `Entity(${name}) with id[${id}] not found`
    );
  }

  static fromDBError(error: Error): RepoError {
    return new RepoError(RepoErrorCode.DB_ERROR, error.message);
  }

  static methodNotImplemented(methodName: string): RepoError {
    return new RepoError(
      RepoErrorCode.METHOD_NOT_IMPLEMENTED,
      `Method ${methodName} is not implemented`
    );
  }
}
