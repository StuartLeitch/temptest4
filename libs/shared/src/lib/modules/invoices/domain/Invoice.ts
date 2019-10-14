// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

// * Subdomains
import {InvoiceId} from './InvoiceId';
import {InvoiceItem} from './InvoiceItem';
import {InvoiceSentEvent} from './events/invoiceSentEvent';
import {InvoicePaidEvent} from './events/invoicePaidEvent';
import {TransactionId} from '../../transactions/domain/TransactionId';
import {PayerId} from '../../payers/domain/PayerId';
// import {PayerType} from '../../payers/domain/PayerType';
// import {Coupon} from '../../coupons/domain/Coupon';

export enum InvoiceStatus {
  DRAFT, // after the internal object has been created
  ACTIVE, // when the customer is being notified
  FINAL // after a resolution has been set: either it was paid, it was waived, or it has been considered bad debt
}

interface InvoiceProps {
  status: InvoiceStatus;
  invoiceNumber?: string; // TODO: AutoIncrement?...Smells bad!
  transactionId?: TransactionId;
  payerId?: PayerId;
  invoiceItems?: InvoiceItem[];
  dateCreated?: Date;
  dateUpdated?: Date;
  // coupons?: Coupon[];
}

export type InvoiceCollection = Invoice[];

export class Invoice extends AggregateRoot<InvoiceProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get invoiceId(): InvoiceId {
    return InvoiceId.create(this.id);
  }

  get transactionId(): TransactionId {
    return this.props.transactionId;
  }

  get payerId(): PayerId {
    return this.props.payerId;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  get invoiceItems(): InvoiceItem[] {
    return this.props.invoiceItems;
  }

  set payerId(payerId: PayerId) {
    this.props.payerId = payerId;
  }

  set transactionId(transactionId: TransactionId) {
    this.props.transactionId = transactionId;
  }

  private constructor(props: InvoiceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: InvoiceProps,
    id?: UniqueEntityID
  ): Result<Invoice> {
    const invoice = new Invoice(
      {
        ...props,
        invoiceItems: props.invoiceItems ? props.invoiceItems : [],
        dateCreated: props.dateCreated ? props.dateCreated : new Date()
      },
      id
    );
    return Result.ok<Invoice>(invoice);
  }

  public send(): void {
    this.addDomainEvent(new InvoiceSentEvent(this.invoiceId, new Date()));
  }

  public markAsActive(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = InvoiceStatus.ACTIVE;
    // this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
  }

  public markAsPaid(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = InvoiceStatus.FINAL;
    this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
  }

  public getValue(): number {
    return this.invoiceItems.reduce(
      (value: number, invoiceItem: InvoiceItem) => {
        value += invoiceItem.price;
        return value;
      },
      0
    );
  }

  public addInvoiceItem(invoiceItem: InvoiceItem): void {
    const alreadyAdded = this.props.invoiceItems.find(i =>
      i.id.equals(invoiceItem.id)
    );

    if (!alreadyAdded) {
      Object.assign(invoiceItem, {invoiceId: this.invoiceId});
      this.props.invoiceItems.push(invoiceItem);
    }
  }

  public removeInvoiceItems(invoiceItem: InvoiceItem): void {
    this.props.invoiceItems = this.props.invoiceItems.filter(
      i => !i.id.equals(invoiceItem.id)
    );
  }

  public clearInvoiceItems(): void {
    this.props.invoiceItems = [];
  }

  public addTax(taxRate: number) {
    const netAmount = this.getValue();
    const taxValue = (netAmount * taxRate) / 100;
    return netAmount + taxValue;
  }

  public redeemCoupon(reduction: number) {
    const netAmount = this.getValue();
    const reductionValue = netAmount * reduction;
    return netAmount - reductionValue;
  }
}
