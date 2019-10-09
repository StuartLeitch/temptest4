// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

// * Subdomain
import {ProductId} from './ProductId';

export interface ProductProps {
  type: string;
  name: string;
  canBeSplit: boolean;
  canBePrinted: boolean;
  isActive: boolean;
}

export abstract class Product extends AggregateRoot<ProductProps> {
  public get id(): UniqueEntityID {
    return this._id;
  }

  public get productId(): ProductId {
    return ProductId.caller(this.id);
  }

  public get type(): string {
    return this.props.type;
  }
}
