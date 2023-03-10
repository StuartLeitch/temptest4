import { PayerType } from '../../../payers/domain/Payer';

export interface PayerInput {
  id?: string;
  invoiceId?: string;
  type?: PayerType;
  name?: string;
  email?: string;
  organization?: string;
  vatId?: string;
  address?: {
    city?: string;
    country?: string;
    state?: string;
    postalCode?: string;
    addressLine1?: string;
  };
}

export interface ConfirmInvoiceDTO {
  payer: PayerInput;
  sanctionedCountryNotificationReceiver?: string;
  sanctionedCountryNotificationSender?: string;
}
