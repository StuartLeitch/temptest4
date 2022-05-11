// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

import { PublisherId } from '../../publishers/domain/PublisherId';
import { JournalId } from '../domain/JournalId';
import { JournalUpdated } from '../domain/events/JournalUpdated';

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
  zeroPriced: boolean;
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

  get id(): UniqueEntityID {
    return this._id;
  }

  get type(): string {
    return this.props.type;
  }

  set type(type: string) {
    this.props.type = type;
  }

  get amount(): number {
    return this.props.amount;
  }

  set amount(newAmount: number) {
    if (this.props.amount !== newAmount) {
      this.generateCatalogUpdatedEvent();
    }
    this.props.amount = newAmount;
  }

  get journalId(): JournalId {
    return this.props.journalId;
  }

  set journalId(journalId: JournalId) {
    this.props.journalId = journalId;
  }

  get journalTitle(): string {
    return this.props.journalTitle;
  }

  set journalTitle(journalTitle: string) {
    this.props.journalTitle = journalTitle;
  }

  get currency(): string {
    return this.props.currency;
  }

  set currency(currency: string) {
    this.props.currency = currency;
  }

  get issn(): string {
    return this.props.issn;
  }

  set issn(issn: string) {
    this.props.issn = issn;
  }

  get code(): string {
    return this.props.code;
  }

  set code(code: string) {
    this.props.code = code;
  }

  get created(): Date {
    return this.props.created;
  }

  set created(created: Date) {
    this.props.created = created;
  }

  get updated(): Date {
    return this.props.updated;
  }

  set updated(updated: Date) {
    this.props.updated = updated;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  set isActive(isActive: boolean) {
    this.props.isActive = isActive;
  }

  get publisherId(): PublisherId {
    return this.props.publisherId;
  }

  set publisherId(publisherId: PublisherId) {
    this.props.publisherId = publisherId;
  }

  get isZeroPriced(): boolean {
    return this.props.zeroPriced;
  }

  set isZeroPriced(zeroPriced: boolean){
    this.props.zeroPriced = zeroPriced;
  }

  public generateCatalogUpdatedEvent(): void {
    const now = new Date();
    this.addDomainEvent(new JournalUpdated(this, now));
  }
}
