import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { NotificationType, Notification } from '../../domain/Notification';
import { NotificationMap } from '../../mappers/NotificationMap';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationId } from '../../domain/NotificationId';

import { SentNotificationRepoContract } from '../SentNotificationRepo';
import { NotificationPause } from '../../domain/NotificationPause';

export class KnexSentNotificationsRepo
  extends AbstractBaseDBRepo<Knex, Notification>
  implements SentNotificationRepoContract {
  async getNotificationById(id: NotificationId): Promise<Notification> {
    const notification = this.db(TABLES.NOTIFICATIONS_SENT)
      .select()
      .where('id', id.id.toString())
      .first();

    if (!notification) {
      throw RepoError.createEntityNotFoundError(
        'notification',
        id.id.toString()
      );
    }

    return NotificationMap.toDomain(notification as any);
  }

  async getNotificationsByInvoiceId(id: InvoiceId): Promise<Notification[]> {
    const notifications = await this.db(TABLES.NOTIFICATIONS_SENT)
      .select()
      .where('invoiceId', id.id.toString());

    return notifications.map(NotificationMap.toDomain);
  }

  async getNotificationsByRecipient(email: string): Promise<Notification[]> {
    const notifications = await this.db(TABLES.NOTIFICATIONS_SENT)
      .select()
      .where('recipientEmail', email);

    return notifications.map(NotificationMap.toDomain);
  }

  async getNotificationsByType(
    type: NotificationType
  ): Promise<Notification[]> {
    const notifications = await this.db(TABLES.NOTIFICATIONS_SENT)
      .select()
      .where('type', type);

    return notifications.map(NotificationMap.toDomain);
  }

  async addNotification(notification: Notification): Promise<Notification> {
    const rawNotification = NotificationMap.toPersistence(notification);

    try {
      await this.db(TABLES.NOTIFICATIONS_SENT).insert(rawNotification);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getNotificationById(notification.notificationId);
  }

  async save(notification: Notification): Promise<Notification> {
    return this.addNotification(notification);
  }

  async updateNotification(notification: Notification): Promise<Notification> {
    const rawNotification = NotificationMap.toPersistence(notification);

    const updated = await this.db(TABLES.NOTIFICATIONS_SENT)
      .where('id', notification.id.toString())
      .update(rawNotification);

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'notification',
        notification.id.toString()
      );
    }

    return notification;
  }

  async exists(notification: Notification): Promise<boolean> {
    try {
      await this.getNotificationById(notification.notificationId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }

  async getNotificationPausedStatus(
    invoiceId: InvoiceId
  ): Promise<NotificationPause> {
    const pause = await this.db(TABLES.PAUSED_REMINDERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!pause) {
      return {
        confirmation: false,
        payment: false,
        invoiceId
      };
    } else {
      return {
        confirmation: pause.pauseConfirmation,
        payment: pause.pausePayment,
        invoiceId
      };
    }
  }
}
