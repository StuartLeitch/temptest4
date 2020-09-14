import {
  Invoice,
  Payer,
  InvoiceItem,
  Address,
  Article,
  Payment,
  PaymentMethod,
} from '@hindawi/shared';

export interface ErpData {
  invoice: Invoice;
  items: InvoiceItem[];
  payer: Payer;
  article: Article;
  billingAddress: Address;
  journalName?: string;
  vatNote?: Record<string, unknown>;
  rate?: number;
  total?: number;
  invoiceTotal?: number;
  tradeDocumentItemProduct: string;
  customSegmentId?: string;
  taxRateId?: string;
  customerId?: string;
  itemId?: string;
  payments?: Payment[];
  paymentMethods?: PaymentMethod[];
  creditAccountId?: string;
  debitAccountId?: string;
  journalId?: string;
  creditNote?: Invoice;
  creditNoteId?: string;
}

export interface ErpResponse {
  accountId: string;
  tradeDocumentId: string;
  tradeItemIds: string[];
}

export interface ErpServiceContract {
  registerInvoice(data: ErpData): Promise<ErpResponse>;
  registerRevenueRecognition(data: any): Promise<any>;
  registerCreditNote?(data: any): Promise<any>;
  registerPayment?(data: any): Promise<any>;
}
