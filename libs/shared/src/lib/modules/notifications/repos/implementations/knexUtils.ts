import { InvoiceId } from '../../../invoices/domain/InvoiceId';

import { NotificationPause } from '../../domain/NotificationPause';

export interface PausePersistance {
  pauseConfirmation: boolean;
  pausePayment: boolean;
  invoiceId: string;
}

export const emptyPause: PausePersistance = {
  pauseConfirmation: false,
  pausePayment: false,
  invoiceId: ''
};

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
  data: PausePersistance = emptyPause
): NotificationPause {
  return {
    confirmation: data.pauseConfirmation,
    payment: data.pausePayment,
    invoiceId
  };
}
