import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { PausedReminderRepoContract } from '../PausedReminderRepo';
import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

const notificationTypeToPersistance = {
  [NotificationType.REMINDER_CONFIRMATION]: 'confirmation',
  [NotificationType.REMINDER_PAYMENT]: 'payment'
};

export class MockPausedReminderRepo extends BaseMockRepo<NotificationPause>
  implements PausedReminderRepoContract {
  constructor() {
    super();
  }

  async save(pause: NotificationPause): Promise<NotificationPause> {
    const alreadyExists = await this.exists(pause);

    if (alreadyExists) {
      throw new Error('duplicate');
    }

    this._items.push(cloneDeep(pause));

    return pause;
  }

  async exists(pause: NotificationPause): Promise<boolean> {
    const match = this._items.find(item => this.compareMockItems(item, pause));

    return !!match;
  }

  async getNotificationPausedStatus(
    invoiceId: InvoiceId
  ): Promise<NotificationPause> {
    const found = this._items.find(pause => pause.invoiceId.equals(invoiceId));

    if (!found) {
      throw new Error('does not exist');
    }

    return found;
  }

  async insertBasePause(invoiceId: InvoiceId) {
    const pause: NotificationPause = {
      invoiceId,
      confirmation: false,
      payment: false
    };

    return this.save(pause);
  }

  async setReminderPauseState(
    invoiceId: InvoiceId,
    state: boolean,
    type: NotificationType
  ): Promise<void> {
    const index = this._items.findIndex(item =>
      item.invoiceId.equals(invoiceId)
    );

    if (!notificationTypeToPersistance[type]) {
      return;
    }

    if (index == -1) {
      throw new Error('does not exist');
    }

    this._items[index][notificationTypeToPersistance[type]] = state;
  }

  compareMockItems(a: NotificationPause, b: NotificationPause): boolean {
    return a.invoiceId.equals(b.invoiceId);
  }
}
