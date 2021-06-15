import { UniqueEntityID } from '../../../core/domain/UniqueEntityID'
import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import  { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { InvoiceErpReferences } from './../../invoices/domain/InvoiceErpReferences';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { ErpReference } from '../domain/ErpReference';

export interface ErpReferenceRepoContract extends Repo<ErpReference> {
  getErpReferencesByInvoiceId(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError, InvoiceErpReferences>>;
  getErpReferencesById(ids: UniqueEntityID[]): Promise<Either<GuardFailure | RepoError, ErpReference[]>>;
  getErpReferenceById(ids: UniqueEntityID): Promise<Either<GuardFailure | RepoError, ErpReference>>;
  save(erpReference: ErpReference): Promise<Either<GuardFailure | RepoError, ErpReference>>;
  filterBy?(criteria: any, items?: any[]): any[];
}
