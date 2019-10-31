import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Name} from '../../../domain/Name';
import {PhoneNumber} from '../../../domain/PhoneNumber';
import {Email} from '../../../domain/Email';
import {AddressId} from '../../addresses/domain/AddressId';
import {Mapper} from '../../../infrastructure/Mapper';

import {Payer} from '../domain/Payer';
import {PayerTitle} from '../domain/PayerTitle';
import {PayerName} from '../domain/PayerName';
import {PayerType} from '../domain/PayerType';

export interface PayerPersistenceDTO {
  id: string;
  title?: string;
  surname: string;
  name: string;
  organization?: string;
  uniqueIdentificationNumber?: string;
  email?: string;
  phone?: string;
  type: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  VATId?: string;
  dateAdded?: Date;
}

export class PayerMap extends Mapper<Payer> {
  public static toDomain(raw: PayerPersistenceDTO): Payer {
    const result = Payer.create(
      {
        title: PayerTitle.create(raw.title).getValue(),
        type: PayerType.create(raw.type).getValue(),
        surname: PayerName.create(raw.surname).getValue(),
        name: PayerName.create(raw.name).getValue(),
        organization: Name.create(raw.organization).getValue(),
        email: Email.create(raw.email).getValue(),
        phone: PhoneNumber.create(raw.phone).getValue(),
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
      console.log(result);
    }

    return result.isSuccess ? result.getValue() : null;
  }

  public static toPersistence(payer: Payer): PayerPersistenceDTO {
    return {
      id: payer.id.toString(),
      type: payer.type.value,
      title: payer.title.value,
      surname: payer.surname.value,
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
