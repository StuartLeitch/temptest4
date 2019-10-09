import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {Invoice, STATUS as InvoiceStatus} from '../domain/Invoice';
import {TransactionId} from '../../transactions/domain/TransactionId';

export interface InvoicePersistenceDTO {
  id: string;
  transactionId: string;
  status: InvoiceStatus;
  // totalAmount: number;
  // netAmount: number;
  dateCreated: Date;
}

export class InvoiceMap extends Mapper<Invoice> {
  public static toDomain(raw: InvoicePersistenceDTO): Invoice {
    const invoiceOrError = Invoice.create(
      {
        transactionId: TransactionId.create(
          new UniqueEntityID(raw.transactionId)
        ),
        // netAmount: raw.netAmount,
        // totalAmount: raw.totalAmount,
        status: raw.status,
        dateCreated: new Date(raw.dateCreated)
      },
      new UniqueEntityID(raw.id)
    );

    invoiceOrError.isFailure ? console.log(invoiceOrError) : '';

    return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
  }

  public static toPersistence(invoice: Invoice): InvoicePersistenceDTO {
    return {
      id: invoice.id.toString(),
      transactionId: invoice.transactionId.id.toString(),
      // totalAmount: invoice.totalAmount,
      // netAmount: invoice.netAmount,
      status: invoice.status,
      dateCreated: invoice.dateCreated
    };
  }
}
