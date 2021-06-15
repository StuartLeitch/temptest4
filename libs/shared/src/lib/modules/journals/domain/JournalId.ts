import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Entity } from '../../../core/domain/Entity';

export class JournalId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): JournalId {
    return new JournalId(id);
  }

  toString(): string {
    return this._id.toString();
  }
}
