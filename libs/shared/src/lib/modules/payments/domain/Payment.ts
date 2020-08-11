/* eslint-disable @typescript-eslint/no-inferrable-types */

// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { Result } from '../../../core/logic/Result';
import { Amount } from '../../../domain/Amount';

// * Subdomain
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PayerId } from '../../payers/domain/PayerId';
import { PaymentMethodId } from './PaymentMethodId';
import { PaymentProof } from './payment-proof';
import { PaymentId } from './PaymentId';

export enum PaymentStatus {
  COMPLETED = 'COMPLETED',
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

import { PaymentCompleted } from './events';

export interface PaymentProps {
  invoiceId: InvoiceId;
  payerId: PayerId;
  amount: Amount;
  paymentMethodId?: PaymentMethodId;
  foreignPaymentId?: string;
  datePaid?: Date;
  paymentProof?: PaymentProof;
  status: PaymentStatus;
}

export class Payment extends AggregateRoot<PaymentProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get paymentId(): PaymentId {
    return PaymentId.create(this.id);
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

  get paymentProof(): PaymentProof {
    return this.props.paymentProof;
  }

  set paymentProof(paymentProof: PaymentProof) {
    this.props.paymentProof = paymentProof;
  }

  get amount(): Amount {
    return this.props.amount;
  }

  get datePaid(): Date {
    return this.props.datePaid;
  }

  get foreignPaymentId(): string {
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
  ): Result<Payment> {
    const payment = new Payment(
      {
        ...props,
      },
      id
    );

    return Result.ok<Payment>(payment);
  }

  public movedToCompleted(isFinal: boolean = true): void {
    if (this.status === PaymentStatus.COMPLETED) {
      this.addDomainEvent(new PaymentCompleted(this, isFinal));
    }
  }
}
