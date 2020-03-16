import { differenceInCalendarDays } from 'date-fns';

import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';

import { PaymentReminder } from '../../../../infrastructure/communication-channels/EmailService';

import { SendInvoiceCreditControlReminderDTO as DTO } from './sendInvoiceCreditControlReminderDTO';

export interface CompoundData extends DTO {
  manuscript: Manuscript;
  journal: CatalogItem;
  invoice: Invoice;
  paused: boolean;
}

export async function shouldSendEmail(data: CompoundData) {
  const { invoice, paused } = data;

  const days = differenceInCalendarDays(new Date(), invoice.dateIssued);
  if (invoice.status === InvoiceStatus.ACTIVE && days <= 18 && !paused) {
    return true;
  }
  return false;
}

export function constructCreditControlReminderData(
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
