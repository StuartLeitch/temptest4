// * Core Domain
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Guard } from '../../../core/logic/Guard';

// * Subdomain imports
import { PhoneNumber } from '../../../domain/PhoneNumber';
import { Email } from '../../../domain/Email';
import { Name } from '../../../domain/Name';

import { AddressId } from '../../addresses/domain/AddressId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PayerTitle } from './PayerTitle';
import { PayerName } from './PayerName';
import { PayerId } from './PayerId';

export enum PayerType {
  INSTITUTION = 'INSTITUTION',
  INDIVIDUAL = 'INDIVIDUAL',
}

export interface PayerProps {
  type: PayerType;
  name: PayerName;
  invoiceId: InvoiceId;
  title?: PayerTitle;
  organization?: Name;
  uniqueIdentificationNumber?: string;
  email?: Email;
  phone?: PhoneNumber;
  billingAddressId?: AddressId;
  shippingAddressId?: AddressId;
  VATId?: string;
  dateAdded?: Date;
}

export type PayerCollection = Payer[];

export class Payer extends AggregateRoot<PayerProps> {
  get id(): UniqueEntityID {
    return this._id;
  }

  get payerId(): PayerId {
    return PayerId.create(this.id);
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  get type(): PayerType {
    return this.props.type;
  }

  get title(): PayerTitle {
    return this.props.title;
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

  private constructor(props: PayerProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: PayerProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Payer> {
    const propsResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'Payer Name' },
      { argument: props.type, argumentName: 'Payer Type' },
      { argument: props.billingAddressId, argumentName: 'Address Id' },
    ]);

    if (!propsResult.succeeded) {
      return left(new GuardFailure(propsResult.message));
    }

    const payer = new Payer(
      {
        ...props,
        dateAdded: props.dateAdded ? props.dateAdded : new Date(),
      },
      id
    );

    return right(payer);
  }

  public set(key: string, value: any) {
    this.props[key] = value;
  }

  public setProperties(props: Partial<PayerProps>) {
    Object.assign(this.props, props);
  }
}
