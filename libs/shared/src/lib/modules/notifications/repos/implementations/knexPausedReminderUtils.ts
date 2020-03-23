import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { NotificationPause } from '../../domain/NotificationPause';

export interface PausePersistance {
  pauseConfirmation: boolean;
  pausePayment: boolean;
  invoiceId: string;
}

export function emptyPause(invoiceId: InvoiceId): PausePersistance {
  return {
    invoiceId: invoiceId.id.toString(),
    pauseConfirmation: false,
    pausePayment: false
  };
}

export function mapPauseToPersistance(
  pause: NotificationPause
): PausePersistance {
  return {
    invoiceId: pause.invoiceId.id.toString(),
    pauseConfirmation: pause.confirmation,
    pausePayment: pause.payment
  };
}

export function mapPauseToDomain(
  invoiceId: InvoiceId,
  data: PausePersistance = emptyPause(invoiceId)
): NotificationPause {
  return {
    confirmation: data.pauseConfirmation,
    payment: data.pausePayment,
    invoiceId
  };
}
