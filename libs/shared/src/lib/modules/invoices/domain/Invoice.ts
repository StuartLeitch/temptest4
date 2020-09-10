// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';

// * Subdomains
import { InvoiceId } from './InvoiceId';
import { InvoiceItem } from './InvoiceItem';
import { InvoiceItems } from './InvoiceItems';
import { InvoicePaymentAddedEvent } from './events/invoicePaymentAdded';
import { InvoiceFinalizedEvent } from './events/invoiceFinalized';
import { InvoiceCreated } from './events/invoiceCreated';
import { InvoiceConfirmed } from './events/invoiceConfirmed';
import { InvoiceCreditNoteCreated } from './events/invoiceCreditNoteCreated';
import { TransactionId } from '../../transactions/domain/TransactionId';
import { PayerId } from '../../payers/domain/PayerId';
import { PaymentId } from '../../payments/domain/PaymentId';
// import {PayerType} from '../../payers/domain/PayerType';
// import {Coupon} from '../../coupons/domain/Coupon';

export enum InvoiceStatus {
  DRAFT = 'DRAFT', // after the internal object has been created
  PENDING = 'PENDING', // when a user confirms the invoice from a sanctioned country
  ACTIVE = 'ACTIVE', // when the customer is being notified
  FINAL = 'FINAL', // after a resolution has been set: either it was paid, it was waived, or it has been considered bad debt
}

function twoDigitPrecision(n: number): number {
  return Number.parseFloat(n.toFixed(2));
}

interface InvoiceProps {
  status: InvoiceStatus;
  invoiceNumber?: string;
  transactionId: TransactionId;
  payerId?: PayerId;
  invoiceItems?: InvoiceItems;
  dateCreated?: Date;
  dateUpdated?: Date;
  dateAccepted?: Date;
  dateIssued?: Date;
  dateMovedToFinal?: Date;
  charge?: number;
  totalNumInvoiceItems?: number;
  erpReference?: string;
  nsReference?: string;
  revenueRecognitionReference?: string;
  cancelledInvoiceReference?: string;
  nsRevRecReference?: string;
  creditNoteReference?: string;
  vatnote?: string;
}

export type InvoiceCollection = Invoice[];

export class Invoice extends AggregateRoot<InvoiceProps> {
  get invoiceId(): InvoiceId {
    return InvoiceId.create(this._id).getValue();
  }

  get payerId(): PayerId {
    return this.props.payerId;
  }

  set payerId(payerId: PayerId) {
    this.props.payerId = payerId;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  set status(status: InvoiceStatus) {
    this.props.status = status;
  }

  get charge(): number {
    return this.props.charge;
  }

  set charge(charge: number) {
    this.props.charge = charge;
  }

  get dateIssued(): Date {
    return this.props.dateIssued;
  }

  set dateIssued(dateIssued: Date) {
    this.props.dateIssued = dateIssued;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  get dateUpdated(): Date {
    return this.props.dateUpdated;
  }

  set dateUpdated(dateUpdated: Date) {
    this.props.dateUpdated = dateUpdated;
  }

  get dateAccepted(): Date {
    return this.props.dateAccepted;
  }

  set dateAccepted(dateAccepted: Date) {
    this.props.dateAccepted = dateAccepted;
  }

  get dateMovedToFinal(): Date {
    return this.props.dateMovedToFinal;
  }

  set dateMovedToFinal(dateMovedToFinal: Date) {
    this.props.dateMovedToFinal = dateMovedToFinal;
  }

  get invoiceItems(): InvoiceItems {
    return this.props.invoiceItems;
  }

  get invoiceNumber(): string {
    return this.props.invoiceNumber;
  }

  set invoiceNumber(invoiceNumber: string) {
    this.props.invoiceNumber = invoiceNumber;
  }

  get referenceNumber(): string {
    if (!this.props.invoiceNumber || !this.props.dateAccepted) {
      return null;
    }
    const paddedNumber = this.props.invoiceNumber.toString().padStart(5, '0');
    const creationYear = this.props.dateAccepted.getFullYear();
    return `${paddedNumber}/${creationYear}`;
  }

  get transactionId(): TransactionId {
    return this.props.transactionId;
  }

  set transactionId(transactionId: TransactionId) {
    this.props.transactionId = transactionId;
  }

  get erpReference(): string {
    return this.props.erpReference;
  }

  set erpReference(erpReference: string) {
    this.props.erpReference = erpReference;
  }

  get revenueRecognitionReference(): string {
    return this.props.revenueRecognitionReference;
  }

  set revenueRecognitionReference(revenueRecognitionReference: string) {
    this.props.revenueRecognitionReference = revenueRecognitionReference;
  }

  get nsReference(): string {
    return this.props.nsReference;
  }

  set nsReference(nsReference: string) {
    this.props.nsReference = nsReference;
  }

  get nsRevRecReference(): string {
    return this.props.nsRevRecReference;
  }

  set nsRevRecReference(nsRevRecReference: string) {
    this.props.nsRevRecReference = nsRevRecReference;
  }

  get creditNoteReference(): string {
    return this.props.creditNoteReference;
  }

  set creditNoteReference(creditNoteReference: string) {
    this.props.creditNoteReference = creditNoteReference;
  }

  get cancelledInvoiceReference(): string {
    return this.props.cancelledInvoiceReference;
  }

  set cancelledInvoiceReference(cancelledInvoiceReference: string) {
    this.props.cancelledInvoiceReference = cancelledInvoiceReference;

    if (cancelledInvoiceReference) {
      this.addDomainEvent(
        new InvoiceCreditNoteCreated(this.invoiceId, new Date())
      );
    }
  }

  get invoiceTotal(): number {
    return this.getInvoiceTotal();
  }

  get invoiceNetTotal(): number {
    return this.getInvoiceNetTotal();
  }

  get invoiceVatTotal(): number {
    return this.getInvoiceVatTotal();
  }

  get invoiceDiscountTotal(): number {
    return this.getInvoiceDiscountTotal();
  }

  get netTotalBeforeDiscount(): number {
    return this.getInvoiceNetTotalBeforeDiscount();
  }

  get invoiceDiscountPercentageTotal(): number {
    return this.getInvoiceDiscountPercentageTotal();
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
    // this.addDomainEvent(new InvoiceItemIssued(this, invoiceItem));
    return Result.ok<void>();
  }

  public addItems(invoiceItems: InvoiceItem[] | InvoiceItems): void {
    invoiceItems.forEach(this.addInvoiceItem, this);
  }

  private constructor(props: InvoiceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  // tslint:disable-next-line
  public static create(
    props: InvoiceProps,
    id?: UniqueEntityID
  ): Result<Invoice> {
    const defaultValues = {
      ...props,
      totalNumInvoiceItems: props.totalNumInvoiceItems
        ? props.totalNumInvoiceItems
        : 0,
      invoiceItems: props.invoiceItems
        ? props.invoiceItems
        : InvoiceItems.create([]),
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
    };

    const isNewInvoice = !!id === false;
    const invoice = new Invoice(defaultValues, id);

    if (isNewInvoice) {
      // invoice.addDomainEvent(new InvoiceCreated(invoice));
      // Create with initial invoice item from whomever created the invoice
      // invoice.addInvoiceItem(
      //   InvoiceItem.create(props.invoiceId, invoice.manuscriptId).getValue()
      // );
    }

    return Result.ok<Invoice>(invoice);
  }

  public generateCreatedEvent(): void {
    const now = new Date();
    this.addDomainEvent(new InvoiceCreated(this, now));
  }

  public markAsActive(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.status = InvoiceStatus.ACTIVE;
    this.props.dateIssued = new Date();
    this.addDomainEvent(new InvoiceConfirmed(this, now));
  }

  public paymentAdded(paymentId: PaymentId): void {
    const now = new Date();
    this.props.dateUpdated = now;
    // this.props.status = InvoiceStatus.FINAL;
    this.addDomainEvent(
      new InvoicePaymentAddedEvent(this.invoiceId, paymentId, now)
    );
  }

  public markAsFinal(): void {
    const now = new Date();
    this.props.dateUpdated = now;
    this.props.dateMovedToFinal = now;
    this.props.status = InvoiceStatus.FINAL;
    if (this.props.dateIssued === null) {
      this.props.dateIssued = new Date();
    }
    this.addDomainEvent(new InvoiceFinalizedEvent(this, now));
  }

  public getInvoiceTotal(): number {
    if (this.invoiceItems.length === 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce(
        (acc, item) => acc + item.calculateTotalPrice(),
        0
      )
    );
  }

  public getInvoiceDiscountTotal(): number {
    if (this.invoiceItems.length == 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce((acc, item) => acc + item.calculateDiscount(), 0)
    );
  }

  public getInvoiceDiscountPercentageTotal(): number {
    if (this.invoiceItems.length == 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    const totalItemsDiscount = this.invoiceItems.reduce(
      (acc, item) => acc + item.calculateTotalDiscountPercentage(),
      0
    );

    return twoDigitPrecision(totalItemsDiscount / this.invoiceItems.length);
  }

  public getInvoiceNetTotalBeforeDiscount(): number {
    return twoDigitPrecision(
      this.getInvoiceNetTotal() + this.getInvoiceDiscountTotal()
    );
  }

  public getInvoiceVatTotal(): number {
    if (this.invoiceItems.length == 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce((acc, item) => acc + item.calculateVat(), 0)
    );
  }

  public getInvoiceNetTotal(): number {
    if (this.invoiceItems.length == 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce((acc, item) => acc + item.calculateNetPrice(), 0)
    );
  }

  // public getValue(): number {
  //   return this.invoiceItems.reduce(
  //     (value: number, invoiceItem: InvoiceItem) => {
  //       value += invoiceItem.price;
  //       return value;
  //     },
  //     0
  //   );
  // }

  // public addInvoiceItem(invoiceItem: InvoiceItem): void {
  //   const alreadyAdded = this.props.invoiceItems.find(i =>
  //     i.id.equals(invoiceItem.id)
  //   );

  //   if (!alreadyAdded) {
  //     Object.assign(invoiceItem, {invoiceId: this.invoiceId});
  //     this.props.invoiceItems.push(invoiceItem);
  //   }
  // }

  // public removeInvoiceItems(invoiceItem: InvoiceItem): void {
  //   this.props.invoiceItems = this.props.invoiceItems.filter(
  //     i => !i.id.equals(invoiceItem.id)
  //   );
  // }

  // public clearInvoiceItems(): void {
  //   this.props.invoiceItems = [];
  // }

  // public addTax(taxRate: number) {
  //   const netAmount = this.getValue();
  //   const taxValue = (netAmount * taxRate) / 100;
  //   return netAmount + taxValue;
  // }

  // public redeemCoupon(reduction: number) {
  //   const netAmount = this.getValue();
  //   const reductionValue = netAmount * reduction;
  //   return netAmount - reductionValue;
  // }
}
