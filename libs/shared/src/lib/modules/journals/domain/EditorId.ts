import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Entity } from '../../../core/domain/Entity';

export class EditorId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): EditorId {
    return new EditorId(id);
  }

  toString(): string {
    return this._id.toString();
  }
}
