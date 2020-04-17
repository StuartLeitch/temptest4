import { Repo } from '../../../infrastructure/Repo';

import { NotificationPause } from '../domain/NotificationPause';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { NotificationType } from '../domain/Notification';

export interface PausedReminderRepoContract extends Repo<NotificationPause> {
  getNotificationPausedStatus(invoiceId: InvoiceId): Promise<NotificationPause>;
  insertBasePause(invoiceId: InvoiceId): Promise<NotificationPause>;
  invoiceIdsWithNoPauseSettings(): AsyncGenerator<InvoiceId, void, undefined>;
  setReminderPauseState(
    invoiceId: InvoiceId,
    status: boolean,
    type: NotificationType
  ): Promise<void>;
}
