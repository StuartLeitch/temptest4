import { Either } from '../../../core/logic/Either';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { Guard } from '../../../core/logic/Guard';

import { CreditNote } from '../domain/CreditNote';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

// * to be updated with GuardFailure
export class CreditNoteMap extends Mapper<CreditNote> {
  public static toDomain(raw: any): CreditNote {
    const maybeCreditNote = CreditNote.create({
      invoiceId: InvoiceId.create(new UniqueEntityID(raw.invoiceId)).getValue(),
      creationReason: raw.creationReason ?? null,
      dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : null,
      dateIssued: raw.dateIssued ? new Date(raw.dateIssued) : null,
      dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : null,
    });

    maybeCreditNote.isFailure ? console.log(maybeCreditNote) : '';

    return maybeCreditNote.isSuccess ? maybeCreditNote.getValue() : null;
  }

  public static toPersistence(creditNote: CreditNote): any {
    return {
      id: creditNote.id.toString(),
      invoiceId: creditNote.invoiceId.toString(),
      creationReason: creditNote.creationReason,
      dateCreated: creditNote.dateCreated,
      dateIssued: creditNote.dateIssued,
      dateUpdated: creditNote.dateUpdated,
    };
  }
}
