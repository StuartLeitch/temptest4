// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {Guard, GuardArgument} from './../../../core/logic/Guard';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

import {ArticleId} from './../../articles/domain/ArticleId';
import {InvoiceId} from './InvoiceId';
import {InvoiceItemId} from './InvoiceItemId';

export type InvoiceItemType = 'APC' | 'PRINT ORDER';

export interface InvoiceItemProps {
  invoiceId: InvoiceId;
  manuscriptId: ArticleId;
  type?: InvoiceItemType;
  name?: string;
  price?: number;
  dateCreated: Date;
}

export class InvoiceItem extends AggregateRoot<InvoiceItemProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get invoiceItemId(): InvoiceItemId {
    return InvoiceItemId.create(this.id);
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  get type(): InvoiceItemType {
    return this.props.type;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  private constructor(props: InvoiceItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  set price(priceValue: number) {
    this.props.price = priceValue;
  }

  public static create(
    props: InvoiceItemProps,
    id?: UniqueEntityID
  ): Result<InvoiceItem> {
    const guardArgs: GuardArgument[] = [
      {argument: props.invoiceId, argumentName: 'invoiceId'},
      {argument: props.manuscriptId, argumentName: 'manuscriptId'}
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (!guardResult.succeeded) {
      return Result.fail<InvoiceItem>(guardResult.message);
    }

    const defaultValues: InvoiceItemProps = {
      ...props,
      name: props.name ? props.name : 'APC',
      type: props.type ? props.type : 'APC',
      dateCreated: props.dateCreated ? props.dateCreated : new Date()
    };

    const invoiceItem = new InvoiceItem(defaultValues, id);
    return Result.ok<InvoiceItem>(invoiceItem);
  }
}
