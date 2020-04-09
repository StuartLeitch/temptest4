export enum SisifJobTypes {
  SanctionedCountryNotification = 'SanctionedCountryNotification',
  InvoiceCreditControlReminder = 'InvoiceCreditControlReminder',
  InvoiceCreatedNotification = 'InvoiceCreatedNotification',
  InvoiceConfirmReminder = 'InvoiceConfirmReminder',
  InvoicePaymentReminder = 'InvoicePaymentReminder'
}

export type JobData<T = unknown> = T;

export interface Job<T = unknown> {
  id?: string;
  type: string;
  created: string; // ISO Date String
  data: JobData<T>; // Serializable format
}

export class JobBuilder {
  static basic<T = unknown>(
    type: string,
    data: JobData<T>,
    created: Date = new Date(),
    id?: string
  ): Job<T> {
    return {
      created: created.toISOString(),
      data,
      type,
      id
    };
  }
}
