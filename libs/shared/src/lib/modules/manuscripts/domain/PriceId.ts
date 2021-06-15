import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Entity } from '../../../core/domain/Entity';

export class PriceId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): PriceId {
    return new PriceId(id);
  }
}
