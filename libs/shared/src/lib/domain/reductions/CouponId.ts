import {Result} from '../../core/logic/Result';
import {Entity} from '../../core/domain/Entity';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

export class CouponId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): Result<CouponId> {
    return Result.ok<CouponId>(new CouponId(id));
  }
}
