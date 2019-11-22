import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Name } from '../../../domain/Name';
import { PhoneNumber } from '../../../domain/PhoneNumber';
import { Email } from '../../../domain/Email';
import { AddressId } from '../../addresses/domain/AddressId';
import { Mapper } from '../../../infrastructure/Mapper';

import { Payer, PayerType } from '../domain/Payer';
import { PayerTitle } from '../domain/PayerTitle';
import { PayerName } from '../domain/PayerName';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export class PayerMap extends Mapper<Payer> {
  public static toDomain(raw: any): Payer {
    const result = Payer.create(
      {
        name: PayerName.create(raw.name).getValue(),
        invoiceId: InvoiceId.create(
          new UniqueEntityID(raw.invoiceId)
        ).getValue(),
        title: raw.title ? PayerTitle.create(raw.title).getValue() : null,
        type: raw.type ? PayerType[raw.type] : PayerType.INDIVIDUAL,
        organization: raw.organization
          ? Name.create({ value: raw.organization }).getValue()
          : null,
        email: raw.email ? Email.create({ value: raw.email }).getValue() : null,
        phone: raw.phone ? PhoneNumber.create(raw.phone).getValue() : null,
        shippingAddressId: AddressId.create(
          new UniqueEntityID(raw.shippingAddressId)
        ),
        billingAddressId: raw.addressId
          ? AddressId.create(new UniqueEntityID(raw.addressId))
          : AddressId.create(new UniqueEntityID(raw.billingAddressId)),
        VATId: raw.VATId,
        dateAdded: raw.dateAdded ? new Date(raw.dateAdded) : new Date()
      },
      new UniqueEntityID(raw.id)
    );

    if (result.isFailure) {
      console.log('Error:', result);
    }

    return result.isSuccess ? result.getValue() : null;
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
      vatId: payer.VATId
    };
  }
}
