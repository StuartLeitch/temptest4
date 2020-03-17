import { right } from '../../../../core/logic/Result';

import { SchedulingTime } from '../../../../infrastructure/message-queues/contracts/Time';

import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';

import {
  PaymentReminder,
  PaymentReminderType
} from '../../../../infrastructure/communication-channels/EmailService';

import { SendInvoicePaymentReminderDTO as DTO } from './sendInvoicePaymentReminderDTO';

export interface CompoundData extends DTO {
  manuscript: Manuscript;
  journal: CatalogItem;
  invoice: Invoice;
  paused: boolean;
}

export async function shouldSendEmail(data: CompoundData) {
  const { invoice, paused } = data;

  const passedTime = new Date().getTime() - data.invoice.dateIssued.getTime();
  const period = data.job.delay * SchedulingTime.Day;

  if (
    invoice.status === InvoiceStatus.ACTIVE &&
    passedTime <= 3.2 * period &&
    !paused
  ) {
    return right<null, boolean>(true);
  }

  return right<null, boolean>(false);
}

export function constructPaymentReminderData(
  data: CompoundData
): PaymentReminder {
  const { invoice, journal, manuscriptCustomId } = data;

  return {
    manuscriptCustomId,
    catalogItem: journal,
    invoice,
    author: {
      email: data.recipientEmail,
      name: data.recipientName
    },
    sender: {
      email: data.senderEmail,
      name: data.senderName
    }
  };
}

export const numberToTemplateMapper: { [key: number]: PaymentReminderType } = {
  1: 'first',
  2: 'second',
  3: 'third'
};

export async function shouldRescheduleJob(data: CompoundData) {
  const passedTime = new Date().getTime() - data.invoice.dateIssued.getTime();
  const period = data.job.delay * SchedulingTime.Day;

  if (passedTime >= 3 * period) {
    return right<null, boolean>(false);
  }

  return right<null, boolean>(true);
}
