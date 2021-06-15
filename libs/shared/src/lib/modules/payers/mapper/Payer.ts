import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Either, combine, right } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';

import { Mapper } from '../../../infrastructure/Mapper';

import { PhoneNumber } from '../../../domain/PhoneNumber';
import { Payer, PayerType } from '../domain/Payer';
import { PayerTitle } from '../domain/PayerTitle';
import { PayerName } from '../domain/PayerName';
import { Email } from '../../../domain/Email';
import { Name } from '../../../domain/Name';

import { AddressId } from '../../addresses/domain/AddressId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export class PayerMap extends Mapper<Payer> {
  public static toDomain(raw: any): Either<GuardFailure, Payer> {
    const name = PayerName.create(raw.name);
    let organization: Either<GuardFailure, Name> = right(null);
    let phone: Either<GuardFailure, PhoneNumber> = right(null);
    let title: Either<GuardFailure, PayerTitle> = right(null);
    let email: Either<GuardFailure, Email> = right(null);

    if (raw.title) {
      title = PayerTitle.create(raw.title);
    }

    if (raw.organization) {
      organization = Name.create({ value: raw.organization });
    }

    if (raw.email) {
      email = Email.create({ value: raw.email });
    }

    if (raw.phone) {
      phone = PhoneNumber.create(raw.phone);
    }

    const maybePayer = combine(name, organization, phone, title, email).chain(
      ([name, organization, phone, title, email]) => {
        return Payer.create(
          {
            organization,
            email,
            phone,
            title,
            name,
            invoiceId: InvoiceId.create(new UniqueEntityID(raw.invoiceId)),
            type: raw.type ? PayerType[raw.type] : PayerType.INDIVIDUAL,
            shippingAddressId: AddressId.create(
              new UniqueEntityID(raw.shippingAddressId)
            ),
            billingAddressId: raw.addressId
              ? AddressId.create(new UniqueEntityID(raw.addressId))
              : AddressId.create(new UniqueEntityID(raw.billingAddressId)),
            VATId: raw.vatId,
            dateAdded: raw.dateAdded ? new Date(raw.dateAdded) : new Date(),
          },
          new UniqueEntityID(raw.id)
        );
      }
    );

    return maybePayer;
  }

  public static toPersistence(payer: Payer): any {
    return {
      id: payer.id.toString(),
      invoiceId: payer.invoiceId.id.toString(),
      type: payer.type,
      title: payer && payer.title && payer.title.value,
      name: payer.name.value,
      organization: payer && payer.organization && payer.organization.value,
      email: payer.email.value,
      phone: payer && payer.phone && payer.phone.value,
      uniqueIdentificationNumber: payer && payer.uniqueIdentificationNumber,
      shippingAddressId: payer.shippingAddressId.id.toString(),
      billingAddressId: payer.billingAddressId.id.toString(),
      dateAdded: payer.dateAdded,
      vatId: payer.VATId,
    };
  }
}
