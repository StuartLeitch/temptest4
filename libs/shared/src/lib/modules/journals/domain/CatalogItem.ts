// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
import { JournalId } from '../domain/JournalId';

export interface CatalogItemProps {
  type: string;
  amount: number;
  journalId: JournalId;
  journalTitle?: string;
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
}
