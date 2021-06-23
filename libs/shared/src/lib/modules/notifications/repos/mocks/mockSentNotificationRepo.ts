import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { NotificationType, Notification } from '../../domain/Notification';
import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationId } from '../../domain/NotificationId';

import { SentNotificationRepoContract } from '../SentNotificationRepo';

export class MockSentNotificationRepo
  extends BaseMockRepo<Notification>
  implements SentNotificationRepoContract {
  private pauses: NotificationPause[];

  constructor() {
    super();
  }

  async getNotificationById(
    id: NotificationId
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    const match = this._items.find((item) => item.notificationId.equals(id));

    return right(cloneDeep(match));
  }

  async getNotificationsByInvoiceId(
    id: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Notification[]>> {
    const matches = this._items.filter((item) => item.invoiceId.equals(id));

    return right(cloneDeep(matches));
  }

  async getNotificationsByRecipient(
    email: string
  ): Promise<Either<GuardFailure | RepoError, Notification[]>> {
    const matches = this._items.filter((item) => item.recipientEmail === email);

    return right(cloneDeep(matches));
  }

  async getNotificationsByType(
    type: NotificationType
  ): Promise<Either<GuardFailure | RepoError, Notification[]>> {
    const matches = this._items.filter((item) => item.type === type);

    return right(cloneDeep(matches));
  }

  async addNotification(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    const maybeAlreadyExists = await this.exists(notification);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      throw new Error('duplicate');
    }

    this._items.push(cloneDeep(notification));

    return right(notification);
  }

  async updateNotification(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    const maybeAlreadyExists = await this.exists(notification);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (!alreadyExists) {
      throw Error('Notification does not exist');
    }

    this._items = this._items.map((i) => {
      if (this.compareMockItems(i, notification)) {
        return cloneDeep(notification);
      } else {
        return i;
      }
    });

    return right(notification);
  }

  async save(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, Notification>> {
    return this.addNotification(notification);
  }

  async exists(
    notification: Notification
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const match = this._items.find((item) =>
      this.compareMockItems(item, notification)
    );
    return right(!!match);
  }

  compareMockItems(a: Notification, b: Notification): boolean {
    return a.id.equals(b.id);
  }
}
