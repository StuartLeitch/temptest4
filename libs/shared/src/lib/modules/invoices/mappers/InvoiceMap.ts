import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';

import { Invoice } from '../domain/Invoice';
import { TransactionId } from '../../transactions/domain/TransactionId';

export class InvoiceMap extends Mapper<Invoice> {
  public static toDomain(raw: any): Invoice {
    const invoiceOrError = Invoice.create(
      {
        transactionId: TransactionId.create(
          new UniqueEntityID(raw.transactionId)
        ),
        status: raw.status,
        invoiceNumber: raw.invoiceNumber?.toString(),
        dateCreated: new Date(raw.dateCreated),
        dateAccepted: raw.dateAccepted ? new Date(raw.dateAccepted) : null,
        dateIssued: raw.dateIssued ? new Date(raw.dateIssued) : null,
        // dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : null,
        dateMovedToFinal: raw.dateMovedToFinal
          ? new Date(raw.dateMovedToFinal)
          : null,
        erpReference: raw.erpReference ?? null,
        nsReference: raw.nsReference ?? null,
        nsRevRecReference: raw.nsRevRecReference ?? null,
        revenueRecognitionReference: raw.revenueRecognitionReference ?? null,
        cancelledInvoiceReference: raw.cancelledInvoiceReference ?? null,
        creditNoteReference: raw.creditNoteReference ?? null,
      },
      new UniqueEntityID(raw.id)
    );

    invoiceOrError.isFailure ? console.log(invoiceOrError) : '';

    return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
  }

  public static toPersistence(invoice: Invoice): any {
    // console.info(invoice);
    // console.info('invoice.id', invoice.id.toString());
    // console.info('invoice.nsRevRecReference', invoice.nsRevRecReference);
    // console.info(invoice.transactionId);

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
      erpReference: invoice.erpReference ?? null,
      nsReference: invoice.nsReference ?? null,
      nsRevRecReference: invoice.nsRevRecReference ?? null,
      revenueRecognitionReference: invoice.revenueRecognitionReference ?? null,
      cancelledInvoiceReference: invoice.cancelledInvoiceReference ?? null,
      creditNoteReference: invoice.creditNoteReference ?? null,
    };
  }
}
