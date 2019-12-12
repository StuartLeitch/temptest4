import { PayerType } from '../../../payers/domain/Payer';

export interface ApplyVatToInvoiceDTO {
  payerType: PayerType;
  invoiceId: string;
  country: string;
}
