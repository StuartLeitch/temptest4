// * Core Domain
import {AggregateRoot} from '../../../core/domain/AggregateRoot';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Result} from '../../../core/logic/Result';
import {Guard} from '../../../core/logic/Guard';

// * Subdomain imports
import {Name} from '../../../domain/Name';
import {Email} from '../../../domain/Email';
import {PhoneNumber} from '../../../domain/PhoneNumber';
import {AddressId} from '../../addresses/domain/AddressId';
import {PayerId} from './PayerId';
import {PayerName} from './PayerName';
import {PayerType} from './PayerType';
import {PayerTitle} from './PayerTitle';

interface PayerProps {
  type: PayerType;
  title?: PayerTitle;
  surname: PayerName;
  name: PayerName;
  organization?: Name;
  uniqueIdentificationNumber?: string;
  email?: Email;
  phone?: PhoneNumber;
  billingAddressId?: AddressId;
  shippingAddressId?: AddressId;
  VATId?: string;
  dateAdded?: Date;
  country?: string;
}

export type PayerCollection = Payer[];

export class Payer extends AggregateRoot<PayerProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get payerId(): PayerId {
    return PayerId.create(this.id);
  }

  get type(): PayerType {
    return this.props.type;
  }

  get title(): PayerTitle {
    return this.props.title;
  }

  get surname(): PayerName {
    return this.props.surname;
  }

  get name(): PayerName {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get phone(): PhoneNumber {
    return this.props.phone;
  }

  get organization(): Name {
    return this.props.organization;
  }

  get shippingAddressId(): AddressId {
    return this.props.shippingAddressId;
  }

  get billingAddressId(): AddressId {
    return this.props.billingAddressId;
  }

  get dateAdded(): Date {
    return this.props.dateAdded;
  }

  get uniqueIdentificationNumber(): string {
    return this.props.uniqueIdentificationNumber;
  }

  get VATId(): string {
    return this.props.VATId;
  }

  get country(): string {
    return this.props.country;
  }

  private constructor(props: PayerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: PayerProps, id?: UniqueEntityID): Result<Payer> {
    const propsResult = Guard.againstNullOrUndefinedBulk([
      {argument: props.name, argumentName: 'name'},
      {argument: props.surname, argumentName: 'surname'},
      {argument: props.type, argumentName: 'type'}
    ]);
    if (!propsResult.succeeded) {
      return Result.fail<Payer>(propsResult.message);
    }

    const payer = new Payer(
      {
        ...props,
        dateAdded: props.dateAdded ? props.dateAdded : new Date()
      },
      id
    );

    return Result.ok<Payer>(payer);
  }

  public set(key: string, value: any) {
    this.props[key] = value;
  }
}
