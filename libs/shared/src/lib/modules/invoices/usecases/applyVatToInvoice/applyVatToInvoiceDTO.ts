import { PayerType } from '../../../payers/domain/Payer';

export interface ApplyVatToInvoiceDTO {
  payerType: PayerType;
  postalCode: string;
  invoiceId: string;
  country: string;
  state: string;
}
