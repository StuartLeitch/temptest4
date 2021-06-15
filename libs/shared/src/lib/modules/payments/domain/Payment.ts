import { cloneDeep } from 'lodash';

// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';
import { Amount } from '../../../domain/Amount';

// * Subdomain
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { ExternalOrderId } from './external-order-id';
import { PayerId } from '../../payers/domain/PayerId';
import { PaymentMethodId } from './PaymentMethodId';
import { PaymentId } from './PaymentId';

export enum PaymentStatus {
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

import { PaymentCompleted } from './events';

export interface PaymentProps {
  status: PaymentStatus;
  invoiceId: InvoiceId;
  payerId: PayerId;
  amount: Amount;
  foreignPaymentId?: ExternalOrderId;
  paymentMethodId?: PaymentMethodId;
  paymentProof?: ExternalOrderId;
  datePaid?: Date;
}

export class Payment extends AggregateRoot<PaymentProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get paymentId(): PaymentId {
    return PaymentId.create(this._id);
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  get payerId(): PayerId {
    return this.props.payerId;
  }

  get paymentMethodId(): PaymentMethodId {
    return this.props.paymentMethodId;
  }

  get paymentProof(): ExternalOrderId {
    return this.props.paymentProof;
  }

  set paymentProof(paymentProof: ExternalOrderId) {
    this.props.paymentProof = paymentProof;
  }

  get amount(): Amount {
    return this.props.amount;
  }

  get datePaid(): Date {
    return this.props.datePaid;
  }

  set foreignPaymentId(paymentId: ExternalOrderId) {
    this.props.foreignPaymentId = paymentId;
  }

  get foreignPaymentId(): ExternalOrderId {
    return this.props.foreignPaymentId;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  set status(status: PaymentStatus) {
    this.props.status = status;
  }

  private constructor(props: PaymentProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: PaymentProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Payment> {
    const payment = new Payment(
      {
        ...props,
      },
      id
    );

    return right(payment);
  }

  public markAsFailed(): void {
    this.status = PaymentStatus.FAILED;
    this.props.datePaid = new Date();
  }

  public markAsCompleted(isFinal: boolean = true): void {
    this.status = PaymentStatus.COMPLETED;
    this.props.datePaid = new Date();
    this.addCompletedEvent(isFinal);
  }

  public markAsPending(): void {
    this.status = PaymentStatus.PENDING;
    this.props.datePaid = new Date();
  }

  public addCompletedEvent(isFinal: boolean = true): void {
    if (this.status === PaymentStatus.COMPLETED) {
      this.addDomainEvent(new PaymentCompleted(cloneDeep(this), isFinal));
    }
  }
}
