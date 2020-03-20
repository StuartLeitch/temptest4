import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { NotificationType, Notification } from '../../domain/Notification';
import { SentNotificationRepoContract } from '../SentNotificationRepo';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationId } from '../../domain/NotificationId';
import { NotificationPause } from '../../domain/NotificationPause';

export class MockSentNotificationRepo extends BaseMockRepo<Notification>
  implements SentNotificationRepoContract {
  private pauses: NotificationPause[];

  constructor() {
    super();
  }

  async getNotificationById(id: NotificationId): Promise<Notification> {
    const match = this._items.find(item => item.notificationId.equals(id));

    if (match) {
      return cloneDeep(match);
    } else {
      return null;
    }
  }

  async getNotificationsByInvoiceId(id: InvoiceId): Promise<Notification[]> {
    const matches = this._items.filter(item => item.invoiceId.equals(id));

    if (matches.length > 0) {
      return cloneDeep(matches);
    } else {
      return null;
    }
  }

  async getNotificationsByRecipient(email: string): Promise<Notification[]> {
    const matches = this._items.filter(item => item.recipientEmail === email);

    if (matches.length > 0) {
      return cloneDeep(matches);
    } else {
      return null;
    }
  }

  async getNotificationsByType(
    type: NotificationType
  ): Promise<Notification[]> {
    const matches = this._items.filter(item => item.type === type);

    if (matches.length > 0) {
      return cloneDeep(matches);
    } else {
      return null;
    }
  }

  async addNotification(notification: Notification): Promise<Notification> {
    const alreadyExists = await this.exists(notification);

    if (alreadyExists) {
      throw Error('duplicate');
    }

    this._items.push(cloneDeep(notification));

    return notification;
  }

  async updateNotification(notification: Notification): Promise<Notification> {
    const alreadyExists = await this.exists(notification);

    if (!alreadyExists) {
      throw Error('Notification does not exist');
    }

    this._items = this._items.map(i => {
      if (this.compareMockItems(i, notification)) {
        return cloneDeep(notification);
      } else {
        return i;
      }
    });

    return notification;
  }

  async save(notification: Notification): Promise<Notification> {
    return this.addNotification(notification);
  }

  async exists(notification: Notification): Promise<boolean> {
    const match = this._items.find(item =>
      this.compareMockItems(item, notification)
    );
    return !!match;
  }

  async getNotificationPausedStatus(
    invoiceId: InvoiceId
  ): Promise<NotificationPause> {
    const found = this.pauses.find(pause => pause.invoiceId.equals(invoiceId));

    if (!found) {
      throw Error(
        `Notification pause does not exist for the provided invoice id {${invoiceId.id.toString()}}`
      );
    }

    return found;
  }

  async setNotificationPausedStatus(
    newPause: NotificationPause
  ): Promise<void> {
    const found = this.pauses.find(pause =>
      pause.invoiceId.equals(newPause.invoiceId)
    );

    if (found) {
      found.confirmation = newPause.confirmation;
      found.payment = newPause.confirmation;
    } else {
      this.pauses.push(newPause);
    }
  }

  compareMockItems(a: Notification, b: Notification): boolean {
    return a.id.equals(b.id);
  }
}
