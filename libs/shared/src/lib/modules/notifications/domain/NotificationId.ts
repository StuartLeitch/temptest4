import { Result } from './../../../core/logic/Result';
import { Entity } from '../../../core/domain/Entity';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

export class NotificationId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): Result<NotificationId> {
    return Result.ok<NotificationId>(new NotificationId(id));
  }
}
