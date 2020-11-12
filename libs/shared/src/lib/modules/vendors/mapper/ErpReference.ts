import { Mapper } from '../../../infrastructure/Mapper';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { ErpReference } from '../domain/ErpReference';

// import { CommentVote } from '../domain/commentVote';
// import { MemberId } from '../domain/memberId';
// import { CommentId } from '../domain/commentId';
// import { VoteType } from '../domain/vote';

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
      throw new Error(erpReferenceOrError.value);
    }

    return erpReferenceOrError?.value;
  }

  public static toPersistence(erpReference: ErpReference): any {
    return erpReference;
  }
}
