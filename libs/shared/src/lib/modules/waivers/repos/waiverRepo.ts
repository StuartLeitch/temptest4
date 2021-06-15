import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { WaiverAssignedCollection } from '../domain/WaiverAssignedCollection';
import { InvoiceItemId } from '../../invoices/domain/InvoiceItemId';
import { WaiverType, Waiver } from '../domain/Waiver';

export interface WaiverRepoContract extends Repo<Waiver> {
  getWaivers(): Promise<Either<GuardFailure | RepoError, Waiver[]>>;
  getWaiversByInvoiceItemId(invoiceItemId: InvoiceItemId): Promise<Either<GuardFailure | RepoError, WaiverAssignedCollection>>;
  getWaiverByType(waiverType: WaiverType): Promise<Either<GuardFailure | RepoError, Waiver>>;
  getWaiversByTypes(waiverTypes: WaiverType[]): Promise<Either<GuardFailure | RepoError, Waiver[]>>;
  removeInvoiceItemWaivers(invoiceItemId: InvoiceItemId): Promise<Either<GuardFailure | RepoError, void>>;
  attachWaiverToInvoiceItem(
    waivers: WaiverType,
    invoiceItemId: InvoiceItemId,
    dateCreated?: Date
  ): Promise<Either<GuardFailure | RepoError, Waiver>>;
}
