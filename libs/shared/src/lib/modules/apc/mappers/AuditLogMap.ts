import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Apc } from '../domain/Apc';

export class ApcMap extends Mapper<Apc> {
  public static toDomain(raw: any): Either<GuardFailure, Apc> {
    return Apc.create(
      {
        journalName: raw.journalName,
        journalCode: raw.journalCode,
        issn: raw.issn,
        publisher: raw.publisher,
        apc: raw.apc,
      },
      new UniqueEntityID(raw.id)
    );
  }

  public static toPersistence(apc: Apc): any {
    return {
      id: Apc.id.toString(),
      journalName: apc.journalName,
      journalCode: apc.journalCode,
      issn: apc.issn,
      publisher: apc.publisher,
      apc: apc.apc,
    };
  }
}
