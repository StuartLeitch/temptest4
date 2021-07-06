import { Entity } from '../../../core/domain/Entity';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

//to be refined with Either/Guard
export class CreditNoteId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): CreditNoteId {
    return new CreditNoteId(id);
  }

  toString(): string {
    return this.id.toString();
  }
}
