import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Waiver} from '../Waiver';
import { InvoiceId } from '../../../modules/invoices/domain/InvoiceId';

export class WaiverMap extends Mapper<Waiver> {
  public static toDomain(raw: any): Waiver {
    const waiverOrError = Waiver.create(
      {
        invoiceId: InvoiceId.create(new UniqueEntityID(raw.invoiceId)).getValue(),
        waiverType: raw.type,
        reduction: raw.reduction
      },
      new UniqueEntityID(raw.id)
    );

    // waiverOrError.isFailure ? console.log(waiverOrError) : '';

    return waiverOrError.isSuccess ? waiverOrError.getValue() : null;
  }

  public static toPersistence(waiver: Waiver): any {
    return {
      id: waiver.id.toString(),
      type: waiver.waiverType,
      percentage: waiver.percentage
    };
  }
}
