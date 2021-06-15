import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { RepoError } from '../../../../infrastructure/RepoError';

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceStatus } from '../../../invoices/domain/Invoice';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

import { PausedReminderRepoContract } from '../PausedReminderRepo';

import {
  mapPauseToPersistance,
  mapPauseToDomain,
  emptyPause,
} from './knexPausedReminderUtils';

import { Transform } from 'stream';

const notificationTypeToPersistance = {
  [NotificationType.REMINDER_CONFIRMATION]: 'pauseConfirmation',
  [NotificationType.REMINDER_PAYMENT]: 'pausePayment',
};

export class KnexPausedReminderRepo
  extends AbstractBaseDBRepo<Knex, NotificationPause>
  implements PausedReminderRepoContract {
  async getNotificationPausedStatus(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, NotificationPause>> {
    const pause = await this.db(TABLES.PAUSED_REMINDERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!pause) {
      return left(
        RepoError.createEntityNotFoundError('pause', invoiceId.id.toString())
      );
    }

    return right(mapPauseToDomain(invoiceId, pause));
  }

  async setReminderPauseState(
    invoiceId: InvoiceId,
    state: boolean,
    type: NotificationType
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const alreadyExists = await this.existsPauseForInvoice(invoiceId);

    if (!alreadyExists) {
      return left(
        RepoError.createEntityNotFoundError('pause', invoiceId.id.toString())
      );
    }

    if (!notificationTypeToPersistance[type]) {
      return right(null);
    }

    try {
      await this.db(TABLES.PAUSED_REMINDERS)
        .where('invoiceId', invoiceId.id.toString())
        .update({
          [notificationTypeToPersistance[type]]: state,
        });
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }

    return right(null);
  }

  async insertBasePause(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, NotificationPause>> {
    const rawPause = emptyPause(invoiceId);

    try {
      await this.db(TABLES.PAUSED_REMINDERS).insert(rawPause);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getNotificationPausedStatus(invoiceId);
  }

  async save(
    pause: NotificationPause
  ): Promise<Either<GuardFailure | RepoError, NotificationPause>> {
    const rawPause = mapPauseToPersistance(pause);

    try {
      await this.db(TABLES.PAUSED_REMINDERS).insert(rawPause);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getNotificationPausedStatus(pause.invoiceId);
  }

  async exists(
    pause: NotificationPause
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      const result = await this.db(TABLES.PAUSED_REMINDERS)
        .select()
        .where('invoiceId', pause.invoiceId)
        .first();
      return right(!!result);
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  private async existsPauseForInvoice(invoiceId: InvoiceId): Promise<boolean> {
    const result = await this.db(TABLES.PAUSED_REMINDERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();
    return !!result;
  }

  async *invoiceIdsWithNoPauseSettings(): AsyncGenerator<
    InvoiceId,
    void,
    undefined
  > {
    const mapToInvoiceIdEntity = new Transform({
      objectMode: true,
      transform(invoice, encoding, callback) {
        const uuid = new UniqueEntityID(invoice.id);
        const invoiceId = InvoiceId.create(uuid);
        callback(null, invoiceId);
      },
    });

    const stream = this.db(TABLES.INVOICES)
      .select('id')
      .leftJoin(
        TABLES.PAUSED_REMINDERS,
        `${TABLES.INVOICES}.id`,
        '=',
        `${TABLES.PAUSED_REMINDERS}.invoiceId`
      )
      .whereNull(`${TABLES.PAUSED_REMINDERS}.invoiceId`)
      .whereNot(`${TABLES.INVOICES}.status`, InvoiceStatus.FINAL)
      .whereNot(`${TABLES.INVOICES}.status`, InvoiceStatus.PENDING)
      .where(`${TABLES.INVOICES}.deleted`, 0)
      .stream({ objectMode: true })
      .pipe(mapToInvoiceIdEntity);

    for await (const a of stream) {
      yield a;
    }
  }
}
