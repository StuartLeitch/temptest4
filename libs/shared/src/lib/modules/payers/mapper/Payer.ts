import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Name} from '../../../domain/Name';
import {PhoneNumber} from '../../../domain/PhoneNumber';
import {Email} from '../../../domain/Email';
import {AddressId} from '../../addresses/domain/AddressId';
import {Mapper} from '../../../infrastructure/Mapper';

import {Payer, PayerType} from '../domain/Payer';
import {PayerTitle} from '../domain/PayerTitle';
import {PayerName} from '../domain/PayerName';
import {InvoiceId} from '../../invoices/domain/InvoiceId';

export interface PayerPersistenceDTO {
  id?: string;
  title?: string;
  invoiceId: string;
  name: string;
  organization?: string;
  uniqueIdentificationNumber?: string;
  email?: string;
  phone?: string;
  type: PayerType;
  shippingAddressId?: string;
  billingAddressId?: string;
  VATId?: string;
  dateAdded?: Date;
}

export class PayerMap extends Mapper<Payer> {
  public static toDomain(raw: PayerPersistenceDTO): Payer {
    const result = Payer.create(
      {
        name: PayerName.create(raw.name).getValue(),
        invoiceId: InvoiceId.create(
          new UniqueEntityID(raw.invoiceId)
        ).getValue(),
        title: raw.title ? PayerTitle.create(raw.title).getValue() : null,
        type: raw.type,
        organization: raw.organization
          ? Name.create({value: raw.organization}).getValue()
          : null,
        email: raw.email ? Email.create({value: raw.email}).getValue() : null,
        phone: raw.phone ? PhoneNumber.create(raw.phone).getValue() : null,
        shippingAddressId: AddressId.create(
          new UniqueEntityID(raw.shippingAddressId)
        ),
        billingAddressId: AddressId.create(
          new UniqueEntityID(raw.billingAddressId)
        ),
        VATId: raw.VATId,
        dateAdded: new Date(raw.dateAdded)
      },
      new UniqueEntityID(raw.id)
    );

    if (result.isFailure) {
      console.log('Error:', result);
    }

    return result.isSuccess ? result.getValue() : null;
  }

  public static toPersistence(payer: Payer): PayerPersistenceDTO {
    return {
      id: payer.id.toString(),
      invoiceId: payer.invoiceId.id.toString(),
      type: payer.type,
      title: payer.title.value,
      name: payer.name.value,
      organization: payer.organization.value,
      email: payer.email.value,
      phone: payer.phone.value,
      uniqueIdentificationNumber: payer.uniqueIdentificationNumber,
      shippingAddressId: payer.shippingAddressId.id.toString(),
      billingAddressId: payer.billingAddressId.id.toString(),
      dateAdded: payer.dateAdded,
      VATId: payer.VATId
    };
  }
}
