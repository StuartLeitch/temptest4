import {Entity} from '../../../core/domain/Entity';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

import {CatalogId} from './CatalogId';
import {CatalogItem} from './CatalogItem';

export interface CatalogProps {
  name: string;
  items?: CatalogItem[];
}

export class Catalog extends Entity<CatalogProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get catalogId(): CatalogId {
    return CatalogId.create(this.id);
  }

  get name(): string {
    return this.props.name;
  }

  get items(): CatalogItem[] {
    return this.props.items;
  }

  public addCatalogItem(catalogItem: CatalogItem): void {
    const alreadyAdded = this.props.items.find(i =>
      i.id.equals(catalogItem.id)
    );

    if (!alreadyAdded) {
      this.props.items.push(catalogItem);
    }
  }

  public removeCatalogItem(catalogItem: CatalogItem): void {
    this.props.items = this.props.items.filter(
      p => !p.id.equals(catalogItem.id)
    );
  }

  private constructor(props: CatalogProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CatalogProps,
    id?: UniqueEntityID
  ): Result<Catalog> {
    return Result.ok<Catalog>(
      new Catalog(
        {
          ...props,
          items: props.items ? props.items : []
        },
        id
      )
    );
  }
}
