// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

// * Subdomain
import { Invoice } from '../../../modules/invoices/domain/Invoice';
// import { TransactionCreatedEvent } from './events/transactionCreatedEvent';
import { TransactionId } from './TransactionId';
import { Invoices } from './Invoices';

export enum TransactionStatus {
  DRAFT = 'DRAFT', // after the internal object has been created
  ACTIVE = 'ACTIVE', // after the Author confirms the list of Payers. An event shall be publicized on the Event Bus.
  FINAL = 'FINAL', // after all its associated invoices are being set to final. An event shall be publicized on the Event Bus.
}

interface TransactionProps {
  status: TransactionStatus; // TransactionState
  invoices?: Invoices;
  dateCreated?: Date; // CreateTimestamp
  dateUpdated?: Date; // LastUpdateTimestamp
  totalNumInvoices?: number;
}

export type TransactionCollection = Transaction[];

export class Transaction extends AggregateRoot<TransactionProps> {
  /**
   * * Getters
   */
  get id(): UniqueEntityID {
    return this._id;
  }

  get transactionId(): TransactionId {
    return TransactionId.create(this.id);
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  get dateUpdated(): Date {
    return this.props.dateUpdated;
  }

  get invoices(): Invoices {
    return this.props.invoices;
  }

  get totalNumInvoices(): number {
    return this.props.totalNumInvoices;
  }

  private constructor(props: TransactionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: TransactionProps,
    id?: UniqueEntityID
  ): Result<Transaction> {
    const defaultValues: TransactionProps = {
      ...props,
      invoices: props.invoices ? props.invoices : Invoices.create([]),
      totalNumInvoices: props.totalNumInvoices ? props.totalNumInvoices : 0,
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
    };
    const transaction = new Transaction(defaultValues, id);

    return Result.ok<Transaction>(transaction);
  }

  private removeInvoiceIfExists(invoice: Invoice): void {
    if (this.props.invoices.exists(invoice)) {
      this.props.invoices.remove(invoice);
    }
  }

  public addInvoice(invoice: Invoice): Result<void> {
    this.removeInvoiceIfExists(invoice);
    this.props.invoices.add(invoice);
    this.props.totalNumInvoices++;
    // this.addDomainEvent(new CommentPosted(this, comment));
    return Result.ok<void>();
  }

  public markAsActive(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = TransactionStatus.ACTIVE;
    // this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
  }

  public markAsFinal(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = TransactionStatus.FINAL;
    // this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
  }
}
