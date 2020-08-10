// * Core Domain
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Result } from '../../../core/logic/Result';
// import {Guard} from '../../core/Guard';

// * Subdomain
import { PaymentMethodId } from './PaymentMethodId';

interface PaymentMethodProps {
  name: string;
  isActive: boolean;
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
  ): Result<PaymentMethod> {
    // const guardResult = Guard.againstNullOrUndefinedBulk([
    //   {argument: props.email, argumentName: 'email'},
    //   {argument: props.password, argumentName: 'password'}
    // ]);
    // if (!guardResult.succeeded) {
    //   return Result.fail<User>(guardResult.message);
    // } else {
    const paymentMethod = new PaymentMethod(
      {
        ...props,
      },
      id
    );
    // const idWasProvided = !!id;
    // if (!idWasProvided) {
    //   user.addDomainEvent(new UserCreatedEvent(user));
    // }
    return Result.ok<PaymentMethod>(paymentMethod);
  }
}
