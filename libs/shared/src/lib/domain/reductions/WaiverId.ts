import {Result} from '../../core/logic/Result';
import {Entity} from '../../core/domain/Entity';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

export class WaiverId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): Result<WaiverId> {
    return Result.ok<WaiverId>(new WaiverId(id));
  }
}
