import {
  Payment,
  Invoice,
  Payer,
  InvoiceItem,
  Journal,
  Article
} from '@hindawi/shared';

export interface ErpData {
  invoice: Invoice;
  items: InvoiceItem[];
  payer: Payer;
  article: Article;
  journal: Journal;
}

export interface ErpServiceContract {
  registerInvoice(data: ErpData): Promise<object>;
  registerPayment(payment: Payment): Promise<object | boolean>;
}
