export interface Invoice {
  id: string;
}

export interface InvoiceState {
  invoice: Invoice;
  loading: boolean;
  error: string | null;
}
