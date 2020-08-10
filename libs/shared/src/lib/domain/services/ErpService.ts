import { Invoice, Payer, InvoiceItem, Address, Article } from '@hindawi/shared';

export interface ErpData {
  invoice: Invoice;
  items: InvoiceItem[];
  payer: Payer;
  article: Article;
  billingAddress: Address;
  journalName?: string;
  vatNote?: Record<string, unknown>;
  rate?: number;
  tradeDocumentItemProduct: string;
  customSegmentId?: string;
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
}
