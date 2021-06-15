// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

// * Subdomain
import { AddressId } from './AddressId';

export interface AddressProps {
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  state?: string;
  postalCode?: string;
  dateCreated?: Date;
  dateUpdated?: Date;
}

export class Address extends AggregateRoot<AddressProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get addressId(): AddressId {
    return AddressId.create(this.id);
  }

  get companyName(): string {
    return this.props.companyName;
  }

  get city(): string {
    return this.props.city;
  }

  get country(): string {
    return this.props.country;
  }

  get state(): string {
    return this.props.state;
  }

  get addressLine1(): string {
    return this.props.addressLine1;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get dateCreated(): Date {
    return this.props.dateCreated;
  }

  private constructor(props: AddressProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: AddressProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Address> {
    const address = new Address(
      {
        ...props,
      },
      id
    );
    return right(address);
  }
}
