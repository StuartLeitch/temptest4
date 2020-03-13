import { Repo } from '../../../infrastructure/Repo';

import { NotificationType, Notification } from '../domain/Notification';
import { NotificationPause } from '../domain/NotificationPause';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { NotificationId } from '../domain/NotificationId';

export interface SentNotificationRepoContract extends Repo<Notification> {
  getNotificationById(id: NotificationId): Promise<Notification>;
  getNotificationsByInvoiceId(invoiceId: InvoiceId): Promise<Notification[]>;
  getNotificationsByType(type: NotificationType): Promise<Notification[]>;
  getNotificationsByRecipient(email: string): Promise<Notification[]>;
  addNotification(notification: Notification): Promise<Notification>;
  updateNotification(notification: Notification): Promise<Notification>;
  getNotificationPausedStatus(invoiceId: InvoiceId): Promise<NotificationPause>;
}
