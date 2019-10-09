// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

export interface CatalogItemProps {
  type: string;
  price: number;
}

export class CatalogItem extends AggregateRoot<CatalogItemProps> {
  private constructor(props: CatalogItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CatalogItemProps,
    id?: UniqueEntityID
  ): Result<CatalogItem> {
    const catalogItem = new CatalogItem(
      {
        ...props
      },
      id
    );
    return Result.ok<CatalogItem>(catalogItem);
  }

  public get id(): UniqueEntityID {
    return this._id;
  }

  public get type(): string {
    return this.props.type;
  }

  public get price(): number {
    return this.props.price;
  }
}
