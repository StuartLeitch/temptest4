import {AddressMap} from '../../mappers/AddressMap';

export class CreateAddress {
  constructor() {}

  public execute(addressProps: any) {
    try {
      return AddressMap.toDomain(addressProps);
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
