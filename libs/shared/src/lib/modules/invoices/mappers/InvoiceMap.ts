import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';

import { Invoice } from '../domain/Invoice';
import { TransactionId } from '../../transactions/domain/TransactionId';
import { ErpReferenceMap } from './../../vendors/mapper/ErpReference';
import { InvoiceErpReferences } from './../domain/InvoiceErpReferences';

export class InvoiceMap extends Mapper<Invoice> {
  public static toDomain(raw: any): Invoice {
    const invoiceOrError = Invoice.create(
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
        erpReferences:
          raw.erpReferences &&
          raw.erpReferences.every((ef) => ef.vendor && ef.type)
            ? InvoiceErpReferences.create(
                raw.erpReferences.map(ErpReferenceMap.toDomain)
              )
            : InvoiceErpReferences.create([]),
      },
      new UniqueEntityID(raw.id)
    );

    invoiceOrError.isFailure ? console.log(invoiceOrError) : '';

    return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
  }

  public static toPersistence(invoice: Invoice): any {
    return {
      id: invoice.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      status: invoice.status,
      invoiceNumber: Number.parseInt(invoice.invoiceNumber, 10) || null,
      dateCreated: invoice.dateCreated,
      // dateUpdated: invoice.dateUpdated,
      dateAccepted: invoice.dateAccepted,
      dateIssued: invoice.dateIssued,
      dateMovedToFinal: invoice.dateMovedToFinal,
      cancelledInvoiceReference: invoice.cancelledInvoiceReference ?? null,
      creationReason: invoice.creationReason ?? null,
      //  erpReferences: invoice.getErpReferences().getItems(),
    };
  }
}
