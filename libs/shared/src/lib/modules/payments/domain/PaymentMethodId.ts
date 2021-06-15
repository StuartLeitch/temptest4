import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Entity } from '../../../core/domain/Entity';

export class PaymentMethodId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  toString(): string {
    return this._id.toString();
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): PaymentMethodId {
    return new PaymentMethodId(id);
  }
}
