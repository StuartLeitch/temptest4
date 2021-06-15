// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

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
  ): Either<GuardFailure, Country> {
    const country = new Country(
      {
        ...props,
      },
      id
    );
    return right(country);
  }
}
