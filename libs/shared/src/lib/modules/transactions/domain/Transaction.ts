// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

// * Subdomain
import { Invoices } from '../../invoices/domain/Invoices';
import { Invoice } from '../../invoices/domain/Invoice';
import { TransactionId } from './TransactionId';

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
  ): Either<GuardFailure, Transaction> {
    const defaultValues: TransactionProps = {
      ...props,
      invoices: props.invoices ? props.invoices : Invoices.create([]),
      totalNumInvoices: props.totalNumInvoices ? props.totalNumInvoices : 0,
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
    };
    const transaction = new Transaction(defaultValues, id);

    return right(transaction);
  }

  private removeInvoiceIfExists(invoice: Invoice): void {
    if (this.props.invoices.exists(invoice)) {
      this.props.invoices.remove(invoice);
    }
  }

  public addInvoice(invoice: Invoice): void {
    this.removeInvoiceIfExists(invoice);
    this.props.invoices.add(invoice);
    this.props.totalNumInvoices++;
  }

  public markAsActive(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = TransactionStatus.ACTIVE;
  }

  public markAsFinal(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = TransactionStatus.FINAL;
  }
}
