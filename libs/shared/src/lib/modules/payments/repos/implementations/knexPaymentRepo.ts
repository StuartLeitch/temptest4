import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { PaymentMap } from './../../mapper/Payment';
import { PaymentRepoContract } from './../paymentRepo';
import { PaymentId } from './../../domain/PaymentId';
import { Payment } from './../../domain/Payment';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

export class KnexPaymentRepo
  extends AbstractBaseDBRepo<Knex, Payment>
  implements PaymentRepoContract {
  async getPaymentById(paymentId: PaymentId): Promise<Payment> {
    const { db } = this;

    const paymentRow = await db(TABLES.PAYMENTS)
      .select()
      .where('id', paymentId.id.toString())
      .first();

    if (!paymentRow) {
      throw RepoError.createEntityNotFoundError(
        'payment',
        paymentId.id.toString()
      );
    }

    return PaymentMap.toDomain(paymentRow);
  }

  async getPaymentByInvoiceId(invoiceId: InvoiceId): Promise<Payment> {
    const { db } = this;

    const paymentRow = await db(TABLES.PAYMENTS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!paymentRow) {
      // throw RepoError.createEntityNotFoundError(
      //   'payment',
      //   invoiceId.id.toString()
      // );
      return null;
    }

    return PaymentMap.toDomain(paymentRow);
  }

  async getPaymentsByInvoiceId(invoiceId: InvoiceId): Promise<Payment[]> {
    const { db } = this;

    const paymentRows = await db(TABLES.PAYMENTS)
      .select()
      .where('invoiceId', invoiceId.id.toString());

    return paymentRows.reduce((aggregator: any[], p) => {
      aggregator.push(PaymentMap.toDomain(p));
      return aggregator;
    }, []);
  }

  async getPaymentByForeignId(foreignPaymentId: string): Promise<Payment> {
    const result = await this.db(TABLES.PAYMENTS)
      .select()
      .where({ foreignPaymentId })
      .first();

    if (!result) {
      throw RepoError.createEntityNotFoundError(
        'payment by foreignPaymentId',
        foreignPaymentId
      );
    }

    return PaymentMap.toDomain(result);
  }

  private withErpReferenceQuery(
    alias: string,
    associatedField: string,
    type: string,
    vendor: string,
    attribute: string
  ): any {
    const { db } = this;
    return (query) =>
      query
        .column({ [attribute]: `${alias}.value` })
        .leftJoin({ [alias]: TABLES.ERP_REFERENCES }, function () {
          this.on(`${alias}.entity_id`, associatedField)
            .andOn(`${alias}.vendor`, db.raw('?', [vendor]))
            .andOn(`${alias}.type`, db.raw('?', [type]))
            .andOn(`${alias}.attribute`, db.raw('?', [attribute]));
        });
  }

  private filterReadyForRegistration(): any {
    return (query) =>
      query
        .where('payments.status', '=', 'COMPLETED')
        .whereNotNull('payments.foreignPaymentId')
        .whereNull('paymentrefs.value');
  }

  async getUnregisteredErpPayments(): Promise<PaymentId[]> {
    const LIMIT = 25;
    const { db, logger } = this;

    const erpReferencesQuery = db(TABLES.PAYMENTS)
      .column({ invoiceId: 'payments.invoiceId', paymentId: 'payments.id' })
      .select();

    const withPaymentReference = this.withErpReferenceQuery(
      'paymentrefs',
      'payments.id',
      'payment',
      'netsuite',
      'payment'
    );

    // * SQL for retrieving results needed only for Sage registration
    const filterPaymentsReadyForRegistration = this.filterReadyForRegistration();

    const prepareIdsSQL = filterPaymentsReadyForRegistration(
      withPaymentReference(erpReferencesQuery)
    )
      .orderBy('payments.datePaid', 'desc')
      .limit(LIMIT);

    logger.debug('getUnregisteredErpPayments', {
      sql: prepareIdsSQL.toString(),
    });

    const payments = await prepareIdsSQL;

    return payments.map((payment) =>
      PaymentId.create(new UniqueEntityID(payment.paymentId)).getValue()
    );
  }

  async updatePayment(payment: Payment): Promise<Payment> {
    const { logger } = this;

    logger.debug('update', payment);

    const sql = this.db(TABLES.PAYMENTS)
      .where({ id: payment.id.toString() })
      .update(PaymentMap.toPersistence(payment));

    logger.debug('update', {
      sql: sql.toString(),
    });

    const updated = await sql;

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'payment',
        payment.id.toString()
      );
    }

    return this.getPaymentById(payment.paymentId);
  }

  async save(payment: Payment): Promise<Payment> {
    const { db } = this;

    try {
      await db(TABLES.PAYMENTS).insert(PaymentMap.toPersistence(payment));
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return await this.getPaymentById(payment.paymentId);
  }

  async exists(payment: Payment): Promise<boolean> {
    try {
      await this.getPaymentById(payment.paymentId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }
}
