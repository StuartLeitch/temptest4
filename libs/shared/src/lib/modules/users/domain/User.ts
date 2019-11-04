// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';
import {Guard} from '../../../core/logic/Guard';

// * Subdomain
import {Roles} from './enums/Roles';
import {UserId} from './UserId';
import {UserEmail} from './UserEmail';
import {UserPassword} from './UserPassword';
import {AddressId} from '../../addresses/domain/AddressId';
import {CountryId} from '../../countries/domain/CountryId';

// import {UserCreatedEvent} from './events/userCreatedEvent';

export interface UserProps {
  name: string;
  email?: UserEmail;
  password?: UserPassword;
  dateAdded?: Date;
  addressId?: AddressId;
  countryId?: CountryId;
  isActive?: boolean;
  isSanctioned?: boolean;
  isBadDebt?: boolean;
  role?: Roles;
}

export class User extends AggregateRoot<UserProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get userId(): UserId {
    return UserId.create(this.id);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get password(): UserPassword {
    return this.props.password;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isSanctioned(): boolean {
    return this.props.isSanctioned;
  }

  get isBadDebt(): boolean {
    return this.props.isBadDebt;
  }

  get addressId(): AddressId {
    return this.props.addressId;
  }

  get countryId(): CountryId {
    return this.props.countryId;
  }

  get role(): Roles {
    return this.props.role;
  }

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      {argument: props.email, argumentName: 'email'}
      // {argument: props.password, argumentName: 'password'}
    ]);
    if (!guardResult.succeeded) {
      return Result.fail<User>(guardResult.message);
    } else {
      const user = new User(
        {
          ...props,
          dateAdded: props.dateAdded ? props.dateAdded : new Date()
        },
        id
      );
      // const idWasProvided = !!id;
      // if (!idWasProvided) {
      //   user.addDomainEvent(new UserCreatedEvent(user));
      // }
      return Result.ok<User>(user);
    }
  }

  public setRole(role: Roles) {
    this.props.role = role;
  }
}
