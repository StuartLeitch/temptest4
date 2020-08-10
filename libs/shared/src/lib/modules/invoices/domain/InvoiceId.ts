import { Result } from './../../../core/logic/Result';
import { Entity } from '../../../core/domain/Entity';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

export class InvoiceId extends Entity<any> {
  get id(): UniqueEntityID {
    return this._id;
  }

  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  public static create(id?: UniqueEntityID): Result<InvoiceId> {
    return Result.ok<InvoiceId>(new InvoiceId(id));
  }

  toString(): string {
    return this.id.toString();
  }
}
