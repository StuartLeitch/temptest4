import { Either, right, left, flatten } from '../../../core/logic/Either';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { GuardFailure } from '../../../core/logic/GuardFailure';

import { CreditNote } from '../domain/CreditNote';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { ErpReferenceMap } from '../../vendors/mapper/ErpReference';
import { ErpReference } from '../../vendors/domain/ErpReference';

// * to be updated with GuardFailure
export class CreditNoteMap extends Mapper<CreditNote> {
  public static toDomain(raw: any): Either<GuardFailure, CreditNote> {
    let maybeErpReference: Either<GuardFailure, ErpReference> = right(null);
    if (raw.erpReference) {
      maybeErpReference = ErpReferenceMap.toDomain(raw.erpReference);
    }

    if (maybeErpReference.isLeft()) {
      return left(maybeErpReference.value);
    }
    const maybeCreditNote = CreditNote.create(
      {
        invoiceId: InvoiceId.create(new UniqueEntityID(raw.invoiceId)),
        creationReason: raw.creationReason ?? null,
        vat: raw.vat ?? null,
        price: raw.price ?? null,
        persistentReferenceNumber: raw.persistentReferenceNumber ?? null,
        dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : null,
        dateIssued: raw.dateIssued ? new Date(raw.dateIssued) : null,
        dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : null,
        erpReference: maybeErpReference.value,
      },
      new UniqueEntityID(raw.id)
    );

    return maybeCreditNote;
  }

  public static toPersistence(creditNote: CreditNote): any {
    return {
      id: creditNote.id.toString(),
      invoiceId: creditNote.invoiceId.id.toString(),
      creationReason: creditNote.creationReason,
      vat: creditNote.vat,
      price: creditNote.price,
      persistentReferenceNumber: creditNote.persistentReferenceNumber,
      dateCreated: creditNote.dateCreated,
      dateIssued: creditNote.dateIssued,
      dateUpdated: creditNote.dateUpdated,
    };
  }
}
