import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from './../../../core/logic/Result';
import { Entity } from '../../../core/domain/Entity';

export class PublisherId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): Result<PublisherId> {
    return Result.ok<PublisherId>(new PublisherId(id));
  }
}
