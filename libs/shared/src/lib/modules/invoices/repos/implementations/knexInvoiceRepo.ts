import {
  Invoice,
  InvoiceId,
  UniqueEntityID,
  InvoiceRepoContract,
  InvoiceMap,
  TransactionId
} from '../../../..';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';
import {Knex} from '../../../../infrastructure/database/knex';

export class KnexInvoiceRepo extends AbstractBaseDBRepo<Knex, Invoice>
  implements InvoiceRepoContract {

  async getInvoiceById(invoiceId: InvoiceId): Promise<Invoice> {
    const {db} = this;

    const invoice = await db('invoices')
      .select()
      .where('id', invoiceId.id.toString())
      .first();

    if (!invoice) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoiceId.id.toString()
      );
    }

    return InvoiceMap.toDomain(invoice);
  }

  async getInvoicesByTransactionId(
    transactionId: TransactionId
  ): Promise<Invoice[]> {
    const {db} = this;
    const invoices = await db('invoices')
      .select()
      .where('transactionId', transactionId.id.toString());

    return invoices.map(i => InvoiceMap.toDomain(i));
  }

  async delete(invoice: Invoice): Promise<unknown> {
    const {db} = this;

    const deletedRows = await db('invoices')
      .where('id', invoice.id.toString())
      .delete();

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoice.id.toString()
      );
    }

    return deletedRows;
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const {db} = this;

    const updated = await db('invoices')
      .where({id: invoice.id.toString()})
      .update({
        status: invoice.status,
        // totalAmount: invoice.totalAmount,
        // netAmount: invoice.netAmount,
        dateCreated: invoice.dateCreated,
        transactionId: invoice.transactionId.id.toString()
      });

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        invoice.id.toString()
      );
    }

    return invoice;
  }

  async exists(invoice: Invoice): Promise<boolean> {
    try {
      await this.getInvoiceById(invoice.invoiceId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const {db} = this;

    const rawInvoice = InvoiceMap.toPersistence(invoice);

    try {
      await db('invoices').insert(rawInvoice);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getInvoiceById(invoice.invoiceId);
  }

  static makeId(id: string): InvoiceId {
    return InvoiceId.create(new UniqueEntityID(id));
  }
}
