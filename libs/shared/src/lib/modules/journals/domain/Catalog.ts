import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';
import { Entity } from '../../../core/domain/Entity';

import { CatalogItem } from './CatalogItem';
import { CatalogId } from './CatalogId';

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

  private constructor(props: CatalogProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CatalogProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Catalog> {
    return right(
      new Catalog(
        {
          ...props,
          items: props.items ? props.items : [],
        },
        id
      )
    );
  }

  public addCatalogItem(catalogItem: CatalogItem): void {
    const alreadyAdded = this.props.items.find((i) =>
      i.id.equals(catalogItem.id)
    );

    if (!alreadyAdded) {
      this.props.items.push(catalogItem);
    }
  }

  public removeCatalogItem(catalogItem: CatalogItem): void {
    this.props.items = this.props.items.filter(
      (p) => !p.id.equals(catalogItem.id)
    );
  }
}
