import {Knex, TABLES} from '../../../../infrastructure/database/knex';
import {Invoice} from '../../../../modules//invoices/domain/Invoice';
import {InvoiceId} from '../../../../modules//invoices/domain/InvoiceId';
import {Waiver} from '../../Waiver';
import {WaiverId} from '../../WaiverId';
import {WaiverMap} from '../../mappers/WaiverMap';
import {InvoiceId} from './../../../../modules/invoices/domain/InvoiceId';

import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError, RepoErrorCode} from '../../../../infrastructure/RepoError';
import {WaiverRepoContract} from '../waiverRepo';

export class KnexWaiverRepo extends AbstractBaseDBRepo<Knex, Waiver>
  implements WaiverRepoContract {
  public async getWaiverById(waiverId: WaiverId): Promise<Waiver> {
    const {db} = this;

    const waiver = await db(TABLES.WAIVERS)
      .select()
      .where('id', waiverId.id.toString())
      .first();

    if (!waiver) {
      throw RepoError.createEntityNotFoundError(
        'waiver',
        waiverId.id.toString()
      );
    }

    return WaiverMap.toDomain(waiver);
  }

  public async getWaiversByInvoiceId(invoiceId: InvoiceId): Promise<Waiver[]> {
    const {db} = this;

    const waivers = await db(TABLES.WAIVERS)
      .select()
      .where('invoiceId', invoiceId.id.toString());

    return waivers.map(i => WaiverMap.toDomain(i));
  }

  // async getInvoicesByTransactionId(
  //   transactionId: TransactionId
  // ): Promise<Invoice[]> {
  //   const {db} = this;
  //   const invoices = await db('invoices')
  //     .select()
  //     .where('transactionId', transactionId.id.toString());

  //   return invoices.map(i => InvoiceMap.toDomain(i));
  // }

  // async delete(invoice: Invoice): Promise<unknown> {
  //   const {db} = this;

  //   const deletedRows = await db('invoices')
  //     .where('id', invoice.id.toString())
  //     .update({...InvoiceMap.toPersistence(invoice), deleted: 1});

  //   if (!deletedRows) {
  //     throw RepoError.createEntityNotFoundError(
  //       'invoice',
  //       invoice.id.toString()
  //     );
  //   }

  //   return deletedRows;
  // }

  // async update(invoice: Invoice): Promise<Invoice> {
  //   const {db} = this;

  //   const updated = await db('invoices')
  //     .where({id: invoice.invoiceId.id.toString()})
  //     .update({
  //       status: invoice.status,
  //       dateCreated: invoice.dateCreated,
  //       transactionId: invoice.transactionId.id.toString()
  //     });

  //   if (!updated) {
  //     throw RepoError.createEntityNotFoundError(
  //       'invoice',
  //       invoice.id.toString()
  //     );
  //   }

  //   return invoice;
  // }

  async exists(waiver: Waiver): Promise<boolean> {
    // try {
    //   await this.getInvoiceById(invoice.invoiceId);
    // } catch (e) {
    //   if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
    //     return false;
    //   }

    //   throw e;
    // }

    return true;
  }

  async save(waiver: Waiver): Promise<Waiver> {
    const {db} = this;

    const rawWaiver = WaiverMap.toPersistence(waiver);

    try {
      await db(TABLES.WAIVERS).insert(rawWaiver);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getWaiverById(waiver.waiverId);
  }

  // * Attach waiver to invoice
  public async attachWaiverToInvoice(
    waiverId: WaiverId,
    invoiceId: InvoiceId
  ): Promise<void> {
    const {db} = this;

    await db
      .insert({waiverId, invoiceId})
      .into(TABLES.INVOICES_WAIVERS)
      .returning('*');
  }
}
