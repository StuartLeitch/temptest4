import { Either, flatten, right, left } from '../../../core/logic/Either';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Mapper } from '../../../infrastructure/Mapper';

import { InvoiceErpReferences } from './../domain/InvoiceErpReferences';
import { TransactionId } from '../../transactions/domain/TransactionId';
import { ErpReferenceMap } from './../../vendors/mapper/ErpReference';
import { ErpReference } from '../../vendors/domain/ErpReference';
import { Invoice } from '../domain/Invoice';

export class InvoiceMap extends Mapper<Invoice> {
  public static toDomain(raw: any): Either<GuardFailure, Invoice> {
    let maybeErpReference: Either<GuardFailure, ErpReference[]> = right([]);

    if (
      raw.erpReferences &&
      raw.erpReferences.every(
        (ef: { vendor: any; type: any }) => ef.vendor && ef.type
      )
    ) {
      maybeErpReference = flatten(
        (raw.erpReferences as Array<any>).map(ErpReferenceMap.toDomain)
      );
    }

    if (maybeErpReference.isLeft()) {
      return left(maybeErpReference.value);
    }

    const maybeInvoice = Invoice.create(
      {
        transactionId: TransactionId.create(
          new UniqueEntityID(raw.transactionId)
        ),
        status: raw.status,
        invoiceNumber: raw.invoiceNumber?.toString(),
        dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : null,
        dateAccepted: raw.dateAccepted ? new Date(raw.dateAccepted) : null,
        dateIssued: raw.dateIssued ? new Date(raw.dateIssued) : null,
        dateMovedToFinal: raw.dateMovedToFinal
          ? new Date(raw.dateMovedToFinal)
          : null,
        cancelledInvoiceReference: raw.cancelledInvoiceReference ?? null,
        creationReason: raw.creationReason ?? null,
        persistentReferenceNumber: raw.persistentReferenceNumber ?? null,
        erpReferences: InvoiceErpReferences.create(maybeErpReference.value),
      },
      new UniqueEntityID(raw.id)
    );

    return maybeInvoice;
  }

  public static toPersistence(invoice: Invoice): any {
    return {
      id: invoice.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      status: invoice.status,
      invoiceNumber: invoice.invoiceNumber || null,
      dateCreated: invoice.dateCreated,
      dateAccepted: invoice.dateAccepted,
      dateIssued: invoice.dateIssued,
      dateMovedToFinal: invoice.dateMovedToFinal,
      cancelledInvoiceReference: invoice.cancelledInvoiceReference ?? null,
      creationReason: invoice.creationReason ?? null,
      persistentReferenceNumber: invoice.persistentReferenceNumber ?? null,
    };
  }
}
