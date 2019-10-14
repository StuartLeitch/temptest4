import {Entity} from '../../../core/domain/Entity';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

export class InvoiceItemId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): InvoiceItemId {
    return new InvoiceItemId(id);
  }
}
