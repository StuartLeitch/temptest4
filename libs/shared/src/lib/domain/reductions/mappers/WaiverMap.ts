import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Waiver} from '../Waiver';

export class WaiverMap extends Mapper<Waiver> {
  public static toDomain(raw: any): Waiver {
    const waiverOrError = Waiver.create(
      {
        name: raw.name,
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
      type: waiver.type,
      percentage: waiver.percentage
    };
  }
}
