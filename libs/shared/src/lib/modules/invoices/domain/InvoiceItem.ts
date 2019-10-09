// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

import {InvoiceId} from './InvoiceId';

export type InvoiceItemType = 'APC' | 'PRINT ORDER';

export interface InvoiceItemProps {
  invoiceId: InvoiceId;
  type?: InvoiceItemType;
  name?: string;
  price?: number;
}

export class InvoiceItem extends AggregateRoot<InvoiceItemProps> {
  private constructor(props: InvoiceItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: InvoiceItemProps,
    id?: UniqueEntityID
  ): Result<InvoiceItem> {
    const invoiceItem = new InvoiceItem(
      {
        ...props,
        name: props.name ? props.name : 'APC',
        type: props.type ? props.type : 'APC'
      },
      id
    );
    return Result.ok<InvoiceItem>(invoiceItem);
  }

  public set price(priceValue: number) {
    this.props.price = priceValue;
  }

  public get id(): UniqueEntityID {
    return this._id;
  }

  public get type(): InvoiceItemType {
    return this.props.type;
  }

  public get name(): string {
    return this.props.name;
  }

  public get price(): number {
    return this.props.price;
  }
}
