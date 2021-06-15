import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { NotificationType, Notification } from '../domain/Notification';
import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { NotificationId } from '../domain/NotificationId';

export interface SentNotificationRepoContract extends Repo<Notification> {
  getNotificationById(id: NotificationId): Promise<Either<GuardFailure | RepoError,Notification>>;
  getNotificationsByInvoiceId(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError,Notification[]>>;
  getNotificationsByType(type: NotificationType): Promise<Either<GuardFailure | RepoError,Notification[]>>;
  getNotificationsByRecipient(email: string): Promise<Either<GuardFailure | RepoError,Notification[]>>;
  addNotification(notification: Notification): Promise<Either<GuardFailure | RepoError,Notification>>;
  updateNotification(notification: Notification): Promise<Either<GuardFailure | RepoError,Notification>>;
}
