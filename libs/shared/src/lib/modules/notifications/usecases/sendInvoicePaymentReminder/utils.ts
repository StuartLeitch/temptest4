import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { Invoice } from '../../../invoices/domain/Invoice';

import {
  PaymentReminderType,
  PaymentReminder,
} from '../../../../infrastructure/communication-channels/EmailService';

import { SendInvoicePaymentReminderDTO as DTO } from './sendInvoicePaymentReminderDTO';

export interface CompoundData extends DTO {
  manuscript: Manuscript;
  journal: CatalogItem;
  invoice: Invoice;
  paused: boolean;
}

export function constructPaymentReminderData(
  data: CompoundData
): PaymentReminder {
  const { invoice, journal, manuscript } = data;

  return {
    manuscriptCustomId: manuscript.customId,
    catalogItem: journal,
    invoice,
    author: {
      email: data.recipientEmail,
      name: data.recipientName,
    },
    sender: {
      email: data.senderEmail,
      name: data.senderName,
    },
  };
}

export const numberToTemplateMapper: { [key: number]: PaymentReminderType } = {
  1: 'first',
  2: 'second',
  3: 'third',
};
