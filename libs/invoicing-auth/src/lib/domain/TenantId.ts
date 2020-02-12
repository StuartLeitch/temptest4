import { Result } from '../../../../shared/src/lib/core/logic/Result';
import { Entity } from '../../../../shared/src/lib/core/domain/Entity';
import { UniqueEntityID } from '../../../../shared/src/lib/core/domain/UniqueEntityID';

export class TenantId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): Result<TenantId> {
    return Result.ok<TenantId>(new TenantId(id));
  }
}
