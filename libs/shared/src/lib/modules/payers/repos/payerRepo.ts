import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { PayerId } from '../domain/PayerId';
import { Payer } from '../domain/Payer';

export interface PayerRepoContract extends Repo<Payer> {
  getPayerByInvoiceId(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError, Payer>>
  getPayerById(payerId: PayerId): Promise<Either<GuardFailure | RepoError,Payer>>;
  update(payer: Payer): Promise<Either<GuardFailure | RepoError,Payer>>;
}
