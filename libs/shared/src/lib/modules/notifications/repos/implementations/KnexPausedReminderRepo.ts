import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

import { PausedReminderRepoContract } from '../PausedReminderRepo';

import {
  mapPauseToPersistance,
  mapPauseToDomain,
  emptyPause
} from './knexPausedReminderUtils';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';

const notificationTypeToPersistance = {
  [NotificationType.REMINDER_CONFIRMATION]: 'pauseConfirmation',
  [NotificationType.REMINDER_PAYMENT]: 'pausePayment'
};

export class KnexPausedReminderRepo
  extends AbstractBaseDBRepo<Knex, NotificationPause>
  implements PausedReminderRepoContract {
  async getNotificationPausedStatus(
    invoiceId: InvoiceId
  ): Promise<NotificationPause> {
    const pause = await this.db(TABLES.PAUSED_REMINDERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();

    if (!pause) {
      throw new Error(
        `No pause found for invoice with id {${invoiceId.id.toString()}}`
      );
    }

    return mapPauseToDomain(invoiceId, pause);
  }

  async setReminderPauseState(
    invoiceId: InvoiceId,
    state: boolean,
    type: NotificationType
  ): Promise<void> {
    const alreadyExists = await this.existsPauseForInvoice(invoiceId);

    if (!alreadyExists) {
      throw new Error(
        `No pause found for invoice with id {${invoiceId.id.toString()}}`
      );
    }

    if (!notificationTypeToPersistance[type]) {
      return;
    }

    await this.db(TABLES.PAUSED_REMINDERS)
      .where('invoiceId', invoiceId.id.toString())
      .update({
        [notificationTypeToPersistance[type]]: state
      });
  }

  async insertBasePause(invoiceId: InvoiceId): Promise<NotificationPause> {
    const rawPause = emptyPause(invoiceId);

    try {
      await this.db(TABLES.PAUSED_REMINDERS).insert(rawPause);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getNotificationPausedStatus(invoiceId);
  }

  async save(pause: NotificationPause): Promise<NotificationPause> {
    const rawPause = mapPauseToPersistance(pause);

    try {
      await this.db(TABLES.PAUSED_REMINDERS).insert(rawPause);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getNotificationPausedStatus(pause.invoiceId);
  }

  async exists(pause: NotificationPause): Promise<boolean> {
    const result = await this.db(TABLES.PAUSED_REMINDERS)
      .select()
      .where('invoiceId', pause.invoiceId)
      .first();
    return !!result;
  }

  private async existsPauseForInvoice(invoiceId: InvoiceId): Promise<boolean> {
    const result = await this.db(TABLES.PAUSED_REMINDERS)
      .select()
      .where('invoiceId', invoiceId.id.toString())
      .first();
    return !!result;
  }

  async invoiceIdsWithNoPauseSettings(): Promise<InvoiceId[]> {
    const invoices = await this.db(TABLES.INVOICES)
      .select('id')
      .leftJoin(
        TABLES.PAUSED_REMINDERS,
        `${TABLES.INVOICES}.id`,
        '=',
        `${TABLES.PAUSED_REMINDERS}.invoiceId`
      )
      .whereNull(`${TABLES.PAUSED_REMINDERS}.invoiceId`);

    return invoices.map(invoice => {
      const uuid = new UniqueEntityID(invoice.id);
      const invoiceId = InvoiceId.create(uuid).getValue();
      return invoiceId;
    });
  }
}
