// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

import { PublisherId } from '../../publishers/domain/PublisherId';
import { JournalId } from '../domain/JournalId';

export interface CatalogItemProps {
  type: string;
  amount: number;
  currency?: string;
  journalId: JournalId;
  journalTitle?: string;
  issn?: string;
  code?: string;
  created?: Date;
  updated?: Date;
  publisherId?: PublisherId;
  isActive?: boolean;
}

export class CatalogItem extends AggregateRoot<CatalogItemProps> {
  private constructor(props: CatalogItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CatalogItemProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, CatalogItem> {
    const catalogItem = new CatalogItem(
      {
        ...props,
      },
      id
    );
    return right(catalogItem);
  }

  public get id(): UniqueEntityID {
    return this._id;
  }

  public get type(): string {
    return this.props.type;
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get journalId(): JournalId {
    return this.props.journalId;
  }

  public get journalTitle(): string {
    return this.props.journalTitle;
  }

  public get currency(): string {
    return this.props.currency;
  }

  public get issn(): string {
    return this.props.issn;
  }

  public get code(): string {
    return this.props.code;
  }

  public get created(): Date {
    return this.props.created;
  }

  public get updated(): Date {
    return this.props.updated;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  get publisherId(): PublisherId {
    return this.props.publisherId;
  }

  get journalCode(): string {
    return this.props.journalCode;
  }
}
