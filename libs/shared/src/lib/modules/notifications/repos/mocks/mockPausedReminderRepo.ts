import { cloneDeep } from 'lodash';

import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

import { PausedReminderRepoContract } from '../PausedReminderRepo';
import { NotificationPause } from '../../domain/NotificationPause';

const notificationTypeToPersistance = {
  [NotificationType.REMINDER_CONFIRMATION]: 'confirmation',
  [NotificationType.REMINDER_PAYMENT]: 'payment',
};

export class MockPausedReminderRepo
  extends BaseMockRepo<NotificationPause>
  implements PausedReminderRepoContract {
  constructor() {
    super();
  }

  async save(
    pause: NotificationPause
  ): Promise<Either<GuardFailure | RepoError, NotificationPause>> {
    const maybeAlreadyExists = await this.exists(pause);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      return left(
        RepoError.createEntityNotFoundError('pause', pause.invoiceId.toString())
      );
    }

    this._items.push(cloneDeep(pause));

    return right(pause);
  }

  async exists(
    pause: NotificationPause
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const match = this._items.find((item) =>
      this.compareMockItems(item, pause)
    );

    return right(!!match);
  }

  async getNotificationPausedStatus(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, NotificationPause>> {
    const found = this._items.find((pause) =>
      pause.invoiceId.equals(invoiceId)
    );

    if (!found) {
      return left(
        RepoError.createEntityNotFoundError('pause', invoiceId.toString())
      );
    }

    return right(found);
  }

  async insertBasePause(invoiceId: InvoiceId) {
    const pause: NotificationPause = {
      invoiceId,
      confirmation: false,
      payment: false,
    };

    return this.save(pause);
  }

  async setReminderPauseState(
    invoiceId: InvoiceId,
    state: boolean,
    type: NotificationType
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const index = this._items.findIndex((item) =>
      item.invoiceId.equals(invoiceId)
    );

    if (!notificationTypeToPersistance[type]) {
      return;
    }

    if (index == -1) {
      return left(
        RepoError.createEntityNotFoundError('pause', invoiceId.toString())
      );
    }

    this._items[index][notificationTypeToPersistance[type]] = state;
    return right(null);
  }

  async *invoiceIdsWithNoPauseSettings(): AsyncGenerator<
    InvoiceId,
    void,
    undefined
  > {
    yield* [];
  }

  compareMockItems(a: NotificationPause, b: NotificationPause): boolean {
    return a.invoiceId.equals(b.invoiceId);
  }
}
