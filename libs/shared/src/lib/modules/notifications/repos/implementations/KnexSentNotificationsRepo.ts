import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { TABLES } from '../../../../infrastructure/database/knex';

import { NotificationType, Notification } from '../../domain/Notification';
import { NotificationMap } from '../../mappers/NotificationMap';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationId } from '../../domain/NotificationId';

import { SentNotificationRepoContract } from '../SentNotificationRepo';
import Knex from "knex";

export class KnexSentNotificationsRepo
  extends AbstractBaseDBRepo<Knex, Notification>
  implements SentNotificationRepoContract {
  async getNotificationById(
    id: NotificationId
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    const notification = this.db(TABLES.NOTIFICATIONS_SENT)
      .select()
      .where('id', id.id.toString())
      .first();

    if (!notification) {
      return left(
        RepoError.createEntityNotFoundError('notification', id.id.toString())
      );
    }

    return NotificationMap.toDomain(notification as any);
  }

  async getNotificationsByInvoiceId(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Notification[]>> {
    try {
      const notifications = await this.db(TABLES.NOTIFICATIONS_SENT)
        .select()
        .where('invoiceId', id.id.toString())
        .orderBy('dateSent', 'desc');

      return flatten(notifications.map(NotificationMap.toDomain));
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  async getNotificationsByRecipient(
    email: string
  ): Promise<Either<GuardFailure | RepoError, Notification[]>> {
    try {
      const notifications = await this.db(TABLES.NOTIFICATIONS_SENT)
        .select()
        .where('recipientEmail', email);

      return flatten(notifications.map(NotificationMap.toDomain));
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  async getNotificationsByType(
    type: NotificationType
  ): Promise<Either<GuardFailure | RepoError, Notification[]>> {
    try {
      const notifications = await this.db(TABLES.NOTIFICATIONS_SENT)
        .select()
        .where('type', type);

      return flatten(notifications.map(NotificationMap.toDomain));
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  async addNotification(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    const rawNotification = NotificationMap.toPersistence(notification);

    try {
      await this.db(TABLES.NOTIFICATIONS_SENT).insert(rawNotification);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getNotificationById(notification.notificationId);
  }

  async save(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    return this.addNotification(notification);
  }

  async updateNotification(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    const rawNotification = NotificationMap.toPersistence(notification);

    const updated = await this.db(TABLES.NOTIFICATIONS_SENT)
      .where('id', notification.id.toString())
      .update(rawNotification);

    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError(
          'notification',
          notification.id.toString()
        )
      );
    }

    return this.getNotificationById(notification.notificationId);
  }

  async exists(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getNotificationById(notification.notificationId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(e));
    }

    return right(true);
  }
}
