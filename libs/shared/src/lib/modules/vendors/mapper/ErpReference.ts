import { Mapper } from '../../../infrastructure/Mapper';
import { ErpReference } from '../domain/ErpReference';

export class ErpReferenceMap implements Mapper<ErpReference> {
  public static toDomain(raw: any): ErpReference {
    const erpReferenceOrError = ErpReference.create({
      entity_id: raw.entity_id,
      vendor: raw.vendor,
      entity_type: raw.type || raw.entity_type,
      attribute: raw.attribute ?? null,
      value: raw.value ?? null,
    });

    if (erpReferenceOrError.isLeft()) {
      throw new Error(erpReferenceOrError.value.toString());
    }

    return erpReferenceOrError.value;
  }

  public static toPersistence(erpReference: ErpReference): any {
    return {
      entity_id: erpReference.entity_id,
      type: erpReference.entityType,
      vendor: erpReference.vendor,
      attribute: erpReference.attribute,
      value: erpReference.value,
    };
  }
}
