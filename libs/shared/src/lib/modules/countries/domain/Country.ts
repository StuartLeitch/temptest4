// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';
// import {Guard} from '../../core/Guard';

interface CountryProps {
  name: string;
  isoCode: string;
  isWaived: boolean;
  isVATEligible: boolean;
}

export class Country extends AggregateRoot<CountryProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get isWaived(): boolean {
    return this.props.isWaived;
  }

  get isVATEligible(): boolean {
    return this.props.isVATEligible;
  }

  private constructor(props: CountryProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: CountryProps,
    id?: UniqueEntityID
  ): Result<Country> {
    // const guardResult = Guard.againstNullOrUndefinedBulk([
    //   {argument: props.email, argumentName: 'email'},
    //   {argument: props.password, argumentName: 'password'}
    // ]);
    // if (!guardResult.succeeded) {
    //   return Result.fail<User>(guardResult.message);
    // } else {
    const country = new Country(
      {
        ...props
      },
      id
    );
    // const idWasProvided = !!id;
    // if (!idWasProvided) {
    //   user.addDomainEvent(new UserCreatedEvent(user));
    // }
    return Result.ok<Country>(country);
  }
}
