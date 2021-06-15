import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { NotificationPause } from '../domain/NotificationPause';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { NotificationType } from '../domain/Notification';

export interface PausedReminderRepoContract extends Repo<NotificationPause> {
  getNotificationPausedStatus(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,NotificationPause>>;
  insertBasePause(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,NotificationPause>>;
  invoiceIdsWithNoPauseSettings(): AsyncGenerator<InvoiceId, void, undefined>;
  setReminderPauseState(
    invoiceId: InvoiceId,
    status: boolean,
    type: NotificationType
  ): Promise<Either<GuardFailure | RepoError,void>>;
}
