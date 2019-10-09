import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

import {TenantId} from './TenantId';

interface TenantProps {
  name: string;
}

export type TenantCollection = Tenant[];

export class Tenant extends AggregateRoot<TenantProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get tenantId(): TenantId {
    return TenantId.create(this.id);
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: TenantProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: TenantProps, id?: UniqueEntityID): Result<Tenant> {
    const invoice = new Tenant({...props}, id);
    return Result.ok<Tenant>(invoice);
  }
}
