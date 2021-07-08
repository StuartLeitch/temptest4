import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { TransactionId } from '../../transactions/domain/TransactionId';
import { InvoicePaymentInfo } from '../domain/InvoicePaymentInfo';
import { InvoicePaginated } from '../domain/InvoicesPaginated'
import { InvoiceItemId } from '../domain/InvoiceItemId';
import { InvoiceId } from '../domain/InvoiceId';
import { Invoice } from '../domain/Invoice';

export interface InvoiceRepoContract extends Repo<Invoice> {
  getRecentInvoices(args?: any): Promise<Either<GuardFailure | RepoError,InvoicePaginated>>;
  getInvoiceById(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,Invoice>>;
  getInvoiceByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Either<GuardFailure | RepoError,Invoice>>;
  getInvoicesByTransactionId(transactionId: TransactionId): Promise<Either<GuardFailure | RepoError,Invoice[]>>;
  findByCancelledInvoiceReference(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,Invoice>>;
  getFailedSageErpInvoices(): Promise<Either<GuardFailure | RepoError,InvoiceId[]>>;
  getFailedNetsuiteErpInvoices(): Promise<Either<GuardFailure | RepoError,InvoiceId[]>>;
  getUnrecognizedSageErpInvoices(): Promise<Either<GuardFailure | RepoError,InvoiceId[]>>;
  getUnrecognizedNetsuiteErpInvoices(): Promise<Either<GuardFailure | RepoError,InvoiceId[]>>;
  getInvoicePaymentInfo(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,InvoicePaymentInfo>>;
  getCurrentInvoiceNumber(): Promise<number>;
  getInvoicePayments(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,any[]>>;
  delete(invoice: Invoice): Promise<Either<GuardFailure | RepoError,void>>;
  restore(invoice: Invoice): Promise<Either<GuardFailure | RepoError,void>>;
  update(invoice: Invoice): Promise<Either<GuardFailure | RepoError,Invoice>>;
  existsWithId(id: InvoiceId): Promise<Either<GuardFailure | RepoError,boolean>>;
  getInvoicesIds(
    ids: string[],
    journalIds: string[],
    omitDeleted: boolean
  ): AsyncGenerator<string, void, undefined>;
  filterByInvoiceId?(invoiceId: InvoiceId): unknown;
  getInvoicesByCustomId?(customId: string): Promise<Either<GuardFailure | RepoError,Invoice[]>>;
  getUnregisteredErpCreditNotes(): Promise<Either<GuardFailure | RepoError,InvoiceId[]>>;
  isInvoiceDeleted(id: InvoiceId): Promise<Either<GuardFailure | RepoError,boolean>>;
  getUnrecognizedReversalsNetsuiteErp(): Promise<Either<GuardFailure | RepoError, any[]>>;
}
