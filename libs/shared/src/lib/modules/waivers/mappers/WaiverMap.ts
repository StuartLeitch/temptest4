import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Waiver } from '../domain/Waiver';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export class WaiverMap extends Mapper<Waiver> {
  public static toDomain(raw: any): Waiver {
    const waiverOrError = Waiver.create(
      {
        waiverType: raw.type_id,
        reduction: raw.reduction,
        isActive: raw.isActive
        //metadata: raw.metadata
      },
      new UniqueEntityID(raw.id)
    );

    // waiverOrError.isFailure ? console.log(waiverOrError) : '';

    return waiverOrError.isSuccess ? waiverOrError.getValue() : null;
  }

  public static toPersistence(waiver: Waiver): any {
    return {
      type_id: waiver.waiverType,
      percentage: waiver.percentage,
      isActive: waiver.isActive
    };
  }
}
