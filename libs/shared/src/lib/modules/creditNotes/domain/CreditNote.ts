// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

// *Subdomains
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { CreditNoteId } from '../domain/CreditNoteId';

export enum CreationReason {
  WITHDRAWN_MANUSCRIPT = 'withdrawn-manuscript',
  REDUCTION_APPLIED = 'reduction-applied',
  WAIVED_MANUSCRIPT = 'waived-manuscript',
  CHANGED_PAYER_DETAILS = 'changed-payer-details',
  BAD_DEBT = 'bad-debt',
  OTHER = 'other',
}
interface CreditNoteProps {
  invoiceId: InvoiceId;
  creationReason?: CreationReason;
  vat: number;
  price: number;
  persistentReferenceNumber?: string;
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

  get creationReason(): CreationReason {
    return this.props.creationReason;
  }

  set creationReason(creationReason: CreationReason) {
    this.props.creationReason = creationReason;
  }

  get vat(): number {
    return this.props.vat;
  }

  set vat(vat: number) {
    this.props.vat = vat;
  }

  get price(): number {
    return this.props.price;
  }

  set price(price: number) {
    this.props.price = price;
  }

  get persistentReferenceNumber(): string {
    return this.props.persistentReferenceNumber;
  }

  set persistentReferenceNumber(persistentReferenceNumber: string) {
    this.props.persistentReferenceNumber = persistentReferenceNumber;
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
}
