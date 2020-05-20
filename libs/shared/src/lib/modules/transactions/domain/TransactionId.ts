import { Entity } from '../../../core/domain/Entity';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

export class TransactionId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  toString(): string {
    return this._id.toString();
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): TransactionId {
    return new TransactionId(id);
  }
}
