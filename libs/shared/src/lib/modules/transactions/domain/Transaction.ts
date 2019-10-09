// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

// * Subdomain
import {TransactionId} from './TransactionId';
import {ManuscriptId} from './ManuscriptId';
import {Invoice} from '../../invoices/domain/Invoice';
import {InvoiceItem} from '../../../modules/invoices/domain/InvoiceItem';

export enum STATUS {
  DRAFT, // after the internal object has been created
  ACTIVE, // after the Author confirms the list of Payers. An event shall be publicized on the Event Bus.
  FINAL // after all its associated invoices are being set to final. An event shall be publicized on the Event Bus.
}

interface TransactionProps {
  status: STATUS; // TransactionState
  manuscriptId?: ManuscriptId;
  invoices?: Invoice[];
  dateCreated?: Date; // CreateTimestamp
  dateUpdated?: Date; // LastUpdateTimestamp
}

export type TransactionCollection = Transaction[];

export class Transaction extends AggregateRoot<TransactionProps> {
  // TODO: Ask business what is the correct value
  public static MAX_NUMBER_INVOICES_PER_TRANSACTION = 20;

  private constructor(props: TransactionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: TransactionProps,
    id?: UniqueEntityID
  ): Result<Transaction> {
    const transaction = new Transaction(
      {
        ...props,
        invoices: props.invoices ? props.invoices : [],
        dateCreated: props.dateCreated ? props.dateCreated : new Date()
      },
      id
    );

    // TODO: Waiting confirmation from the PO.
    // const idWasProvided = !!id;
    // if (!idWasProvided) {
    //   transaction.addDomainEvent(
    //     new TransactionCreatedEvent(transaction, new Date())
    //   );
    // }

    return Result.ok<Transaction>(transaction);
  }

  public addInvoice(invoice: Invoice): void {
    const maxLengthExceeded =
      this.props.invoices.length >=
      Transaction.MAX_NUMBER_INVOICES_PER_TRANSACTION;

    const alreadyAdded = this.props.invoices.find(i => i.id.equals(invoice.id));

    if (!alreadyAdded && !maxLengthExceeded) {
      Object.assign(invoice, {transactionId: this.transactionId});
      this.props.invoices.push(invoice);
    }

    // adjust invoices net amounts
    this.adjustInvoices();
  }

  public removeInvoice(invoice: Invoice): void {
    this.props.invoices = this.props.invoices.filter(
      i => !i.id.equals(invoice.id)
    );

    // adjust invoices net amounts
    this.adjustInvoices();
  }

  public clearInvoices(): void {
    this.props.invoices = [];
  }

  private adjustInvoices(): void {
    this.props.invoices.forEach(invoice => {
      // invoice.netAmount = Math.round(
      //   this.amount.value / this.props.invoices.length
      // );
    });
  }

  public markAsFinal(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = STATUS.FINAL;
    // this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
  }

  /**
   * * Getters
   */
  get id(): UniqueEntityID {
    return this._id;
  }

  get transactionId(): TransactionId {
    return TransactionId.create(this.id);
  }

  get manuscriptId(): ManuscriptId {
    return this.props.manuscriptId;
  }

  get status(): STATUS {
    return this.props.status;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  get dateUpdated(): Date {
    return this.props.dateUpdated;
  }

  get invoices(): Invoice[] {
    return this.props.invoices;
  }

  get netAmount(): number {
    return this.props.invoices.reduce((amount: number, invoice: Invoice) => {
      // invoice.netAmount = Math.round(
      //   this.amount.value / this.props.invoices.length
      // );
      amount += invoice.invoiceItems.reduce(
        (price: number, invoiceItem: InvoiceItem) => {
          price += invoiceItem.price;
          return price;
        },
        0
      );
      return amount;
    }, 0);
  }
}
