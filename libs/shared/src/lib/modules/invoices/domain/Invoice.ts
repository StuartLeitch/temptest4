import getMonth from 'date-fns/getMonth';
import isBefore from 'date-fns/isBefore';
import isAfter from 'date-fns/isAfter';
import { getYear } from 'date-fns';

// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';

// * Subdomains
import { InvoiceErpReferences } from './InvoiceErpReferences';
import { InvoiceNumber } from './InvoiceNumber';
import { InvoiceItems } from './InvoiceItems';
import { InvoiceItem } from './InvoiceItem';
import { InvoiceId } from './InvoiceId';

import { InvoiceDraftDueAmountUpdated } from './events/invoiceDraftDueAmountUpdated';
import { InvoicePaymentAddedEvent } from './events/invoicePaymentAdded';
import { InvoiceDraftCreated } from './events/invoiceDraftCreated';
import { InvoiceDraftDeleted } from './events/invoiceDraftDeleted';
import { InvoiceFinalizedEvent } from './events/invoiceFinalized';
import { InvoiceConfirmed } from './events/invoiceConfirmed';
import { InvoiceCreated } from './events/invoiceCreated';

import { TransactionId } from '../../transactions/domain/TransactionId';
import { PaymentId } from '../../payments/domain/PaymentId';
import { PayerId } from '../../payers/domain/PayerId';

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
  invoiceNumber?: number;
  transactionId: TransactionId;
  payerId?: PayerId;
  invoiceItems?: InvoiceItems;
  dateCreated?: Date;
  dateAccepted?: Date;
  dateIssued?: Date;
  dateMovedToFinal?: Date;
  totalNumInvoiceItems?: number;
  vatnote?: string;
  erpReferences?: InvoiceErpReferences;
  persistentReferenceNumber?: string;
  rate?: number;
}

export type InvoiceCollection = Invoice[];

export class Invoice extends AggregateRoot<InvoiceProps> {
  get invoiceId(): InvoiceId {
    return InvoiceId.create(this._id);
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

  get dateIssued(): Date {
    return this.props.dateIssued;
  }

  set dateIssued(dateIssued: Date) {
    this.props.dateIssued = dateIssued;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
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

  get invoiceNumber(): number {
    return this.props.invoiceNumber;
  }

  set invoiceNumber(invoiceNumber: number) {
    this.props.invoiceNumber = invoiceNumber;
  }

  get persistentReferenceNumber(): string {
    // * it it set already through persistence layer, just return it
    if (this.props.persistentReferenceNumber) {
      return this.props.persistentReferenceNumber;
    }

    // * otherwise try to build it
    return this.computeReferenceNumber();
  }

  set persistentReferenceNumber(referenceNumber: string) {
    this.props.persistentReferenceNumber = referenceNumber;
  }

  get transactionId(): TransactionId {
    return this.props.transactionId;
  }

  set transactionId(transactionId: TransactionId) {
    this.props.transactionId = transactionId;
  }

  public getErpReferences(): InvoiceErpReferences {
    return this.props.erpReferences;
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

  public addInvoiceItem(invoiceItem: InvoiceItem): void {
    this.removeInvoiceItemIfExists(invoiceItem);
    this.props.invoiceItems.add(invoiceItem);
    this.props.totalNumInvoiceItems++;
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
  ): Either<GuardFailure, Invoice> {
    const defaultValues = {
      ...props,
      totalNumInvoiceItems: props.totalNumInvoiceItems ?? 0,
      invoiceItems: props.invoiceItems ?? InvoiceItems.create([]),
      erpReferences: props.erpReferences ?? InvoiceErpReferences.create([]),
      dateCreated: props.dateCreated ? props.dateCreated : new Date(),
    };

    const invoice = new Invoice(defaultValues, id);

    return right(invoice);
  }

  public generateInvoiceDraftCreatedEvent(): void {
    if (this.props.status === InvoiceStatus.DRAFT) {
      const now = new Date();
      this.addDomainEvent(new InvoiceDraftCreated(this, now));
    }
  }

  public generateInvoiceDraftDeletedEvent(): void {
    if (this.props.status === InvoiceStatus.DRAFT) {
      const now = new Date();
      this.addDomainEvent(new InvoiceDraftDeleted(this, now));
    }
  }

  public generateInvoiceDraftAmountUpdatedEvent(): void {
    if (this.props.status === InvoiceStatus.DRAFT) {
      const now = new Date();
      this.addDomainEvent(new InvoiceDraftDueAmountUpdated(this, now));
    }
  }

  public generateCreatedEvent(): void {
    const now = new Date();
    this.addDomainEvent(new InvoiceCreated(this, now));
  }

  public markAsActive(): void {
    const now = new Date();
    this.props.status = InvoiceStatus.ACTIVE;
    this.props.dateIssued = new Date();

    if (
      this.props.invoiceNumber &&
      this.props.dateIssued &&
      !this.props.persistentReferenceNumber
    ) {
      this.props.persistentReferenceNumber = this.computeReferenceNumber();
    }

    this.addDomainEvent(new InvoiceConfirmed(this, now));
  }

  public paymentAdded(paymentId: PaymentId): void {
    const now = new Date();
    this.addDomainEvent(
      new InvoicePaymentAddedEvent(this.invoiceId, paymentId, now)
    );
  }

  public markAsFinal(): void {
    const now = new Date();
    this.props.dateMovedToFinal = now;
    this.props.status = InvoiceStatus.FINAL;
    if (this.props.dateIssued === null) {
      this.props.dateIssued = new Date();
    }

    if (
      this.props.invoiceNumber &&
      this.props.dateIssued &&
      !this.props.persistentReferenceNumber
    ) {
      this.props.persistentReferenceNumber = this.computeReferenceNumber();
    }

    this.addDomainEvent(new InvoiceFinalizedEvent(this, now));
  }

  public getInvoicePercentage(): number {
    if (this.invoiceItems.length === 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return this.invoiceItems.map((item) => item.vat).pop();
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
    if (this.invoiceItems.length === 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce((acc, item) => acc + item.calculateDiscount(), 0)
    );
  }

  public getInvoiceDiscountPercentageTotal(): number {
    if (this.invoiceItems.length === 0) {
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
    if (this.invoiceItems.length === 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce((acc, item) => acc + item.calculateVat(), 0)
    );
  }

  public getInvoiceNetTotal(): number {
    if (this.invoiceItems.length === 0) {
      throw new Error(
        `Invoice with id {${this.id.toString()}} does not have any invoice items attached and it was tried to calculate invoice total`
      );
    }

    return twoDigitPrecision(
      this.invoiceItems.reduce((acc, item) => acc + item.calculateNetPrice(), 0)
    );
  }

  public assignInvoiceNumber(
    lastInvoiceNumber: number
  ): Either<GuardFailure, void> {
    const now = new Date();
    const maybeNextInvoiceNumber = InvoiceNumber.create({
      value: lastInvoiceNumber,
    });

    if (maybeNextInvoiceNumber.isLeft()) {
      return left(maybeNextInvoiceNumber.value);
    }

    // * incremental human-readable value
    this.props.invoiceNumber = Number(maybeNextInvoiceNumber.value.value + 1);

    return right(null);
  }

  computeReferenceNumber() {
    let referenceNumberPadded = null;
    let referenceYear = null;

    if (!this.props.invoiceNumber) {
      return null;
    }

    if (this.props.invoiceNumber && !this.props.dateIssued) {
      return null;
    }

    // * should check against dateAccepted
    if (isBefore(this.props.dateIssued, new Date(2020, 11, 8))) {
      referenceNumberPadded = this.props.invoiceNumber
        .toString()
        .padStart(5, '0');
      referenceYear = getYear(this.props.dateAccepted);
    }
    // * should also check against dateAccepted
    else if (
      isAfter(this.props.dateIssued, new Date(2020, 11, 8)) &&
      isBefore(this.props.dateIssued, new Date(2021, 0, 1))
    ) {
      referenceNumberPadded = this.props.invoiceNumber
        .toString()
        .padStart(6, '0');
      referenceYear = getYear(this.props.dateAccepted);
    } else {
      // * should check against dateIssued
      referenceNumberPadded = this.props.invoiceNumber
        .toString()
        .padStart(6, '0');
      referenceYear = getYear(this.props.dateIssued);

      // * getMonth returns a number corresponding to each month,
      // * so January is 0, February is 1, May is 5
      if (getMonth(this.props.dateIssued) >= 5) {
        referenceYear += 1;
      }
    }

    return `${referenceNumberPadded}/${referenceYear}`;
  }
}
