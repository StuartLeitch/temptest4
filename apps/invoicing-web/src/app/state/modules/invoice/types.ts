export interface Invoice {
  id: string;
}

export interface InvoiceState {
  invoice: Invoice | null;
  loading: boolean;
  error: string | null;
}