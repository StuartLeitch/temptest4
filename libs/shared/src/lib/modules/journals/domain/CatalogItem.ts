// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import { JournalId } from '../domain/JournalId';
import { PublisherId } from '../../publishers/domain/PublisherId';

export interface CatalogItemProps {
  type: string;
  amount: number;
  currency?: string;
  journalId: JournalId;
  journalTitle?: string;
  issn?: string;
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
}
