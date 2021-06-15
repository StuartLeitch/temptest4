// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

// * Subdomain
import { PaymentMethodId } from './PaymentMethodId';

interface PaymentMethodProps {
  isActive: boolean;
  name: string;
}

export enum PaymentMethodNames {
  BankTransfer = 'Bank Transfer',
  CreditCard = 'Credit Card',
  Migration = 'Migration',
  PayPal = 'Paypal',
}

export class PaymentMethod extends AggregateRoot<PaymentMethodProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get paymentMethodId(): PaymentMethodId {
    return PaymentMethodId.create(this.id);
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  set isActive(toggle: boolean) {
    this.props.isActive = toggle;
  }

  private constructor(props: PaymentMethodProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: PaymentMethodProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, PaymentMethod> {
    const paymentMethod = new PaymentMethod(
      {
        ...props,
      },
      id
    );
    return right(paymentMethod);
  }
}
