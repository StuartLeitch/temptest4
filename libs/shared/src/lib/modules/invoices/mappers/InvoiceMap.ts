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
        erpReference: raw.erpReference,
        revenueRecognitionReference: raw.revenueRecognitionReference,
        cancelledInvoiceReference: raw.cancelledInvoiceReference ?? null,
      },
      new UniqueEntityID(raw.id)
    );

    invoiceOrError.isFailure ? console.log(invoiceOrError) : '';

    return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
  }

  public static toPersistence(invoice: Invoice): any {
    // console.info(invoice);
    // console.info('invoice.id', invoice.id.toString());
    // console.info('invoice.status', invoice.status);
    // console.info(invoice.transactionId);

    return {
      id: invoice.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      status: invoice.status,
      invoiceNumber: Number.parseInt(invoice.invoiceNumber, 10) || null,
      dateCreated: invoice.dateCreated,
      dateAccepted: invoice.dateAccepted,
      dateIssued: invoice.dateIssued,
      erpReference: invoice.erpReference ?? null,
      revenueRecognitionReference: invoice.revenueRecognitionReference ?? null,
      cancelledInvoiceReference: invoice.cancelledInvoiceReference ?? null,
    };
  }
}
