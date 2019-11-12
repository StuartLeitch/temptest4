import {InvoiceMap} from '../../mappers/InvoiceMap';

export class ChangeInvoiceStatus {
  constructor() {}

  public execute(id: string, status: any) {
    try {
      return InvoiceMap.toDomain({
        status
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
