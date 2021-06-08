// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

// *Subdomains
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { CreditNoteId } from '../domain/CreditNoteId';
import { InvoiceItem } from '../../invoices/domain/InvoiceItem';
import { InvoiceItems } from '../../invoices/domain/InvoiceItems';

interface CreditNoteProps {
  invoiceId: InvoiceId;
  creationReason?: string;
  invoiceItems?: InvoiceItems;
  totalNumInvoiceItems?: number;
  dateCreated?: Date;
  dateIssued?: Date;
  dateUpdated?: Date;
}

export type CreditNoteCollection = CreditNote[];

export class CreditNote extends AggregateRoot<CreditNoteProps> {
  get creditNoteId(): CreditNoteId {
    return CreditNoteId.create(this._id).getValue();
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  set invoiceId(invoiceId: InvoiceId) {
    this.props.invoiceId = invoiceId;
  }

  get creationReason(): string {
    return this.props.creationReason;
  }

  set creationReason(creationReason: string) {
    this.props.creationReason = creationReason;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  set dateCreated(dateCreated: Date) {
    this.props.dateCreated = dateCreated;
  }

  get dateIssued(): Date {
    return this.props.dateIssued;
  }

  set dateIssued(dateIssued: Date) {
    this.props.dateIssued = dateIssued;
  }

  get dateUpdated(): Date {
    return this.props.dateUpdated;
  }

  set dateUpdated(dateUpdated: Date) {
    this.props.dateUpdated = dateUpdated;
  }

  get invoiceItems(): InvoiceItems {
    return this.props.invoiceItems;
  }

  private constructor(props: CreditNoteProps, id?: UniqueEntityID) {
    super(props, id);
  }
  // to be updated with GuardFailure
  public static create(
    props: CreditNoteProps,
    id?: UniqueEntityID
  ): Result<CreditNote> {
    const defaultValues = {
      ...props,
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
    };

    const creditNote = new CreditNote(defaultValues, id);

    return Result.ok<CreditNote>(creditNote);
  }

  private removeInvoiceItemIfExists(invoiceItem: InvoiceItem): void {
    if (this.props.invoiceItems.exists(invoiceItem)) {
      this.props.invoiceItems.remove(invoiceItem);
    }
  }
  public addInvoiceItem(invoiceItem: InvoiceItem): Result<void> {
    this.removeInvoiceItemIfExists(invoiceItem);
    this.props.invoiceItems.add(invoiceItem);
    this.props.totalNumInvoiceItems++;
    return Result.ok<void>();
  }

  public addItems(invoiceItems: InvoiceItem[] | InvoiceItems): void {
    invoiceItems.forEach(this.addInvoiceItem, this);
  }
}
