// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';

interface CustomerProps {
  name: string;
}

export class Customer extends AggregateRoot<CustomerProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: CustomerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CustomerProps,
    id?: UniqueEntityID
  ): Result<Customer> {
    // const guardResult = Guard.againstNullOrUndefinedBulk([
    //   {argument: props.email, argumentName: 'email'},
    //   {argument: props.password, argumentName: 'password'}
    // ]);
    // if (!guardResult.succeeded) {
    //   return Result.fail<User>(guardResult.message);
    // } else {
    const customer = new Customer(
      {
        ...props
      },
      id
    );
    // const idWasProvided = !!id;
    // if (!idWasProvided) {
    //   user.addDomainEvent(new UserCreatedEvent(user));
    // }
    return Result.ok<Customer>(customer);
  }
}
