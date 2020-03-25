import { Repo } from '../../../infrastructure/Repo';

import { NotificationType, Notification } from '../domain/Notification';
import { NotificationPause } from '../domain/NotificationPause';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export interface PausedReminderRepoContract extends Repo<NotificationPause> {
  getNotificationPausedStatus(invoiceId: InvoiceId): Promise<NotificationPause>;
  insertBasePause(invoiceId: InvoiceId): Promise<NotificationPause>;
  setReminderPauseState(
    invoiceId: InvoiceId,
    status: boolean,
    type: NotificationType
  ): Promise<void>;
}
