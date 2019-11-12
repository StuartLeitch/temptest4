type PaymentType = "INDIVIDUAL" | "INSTITUTION";

export interface Invoice {
  id: string;
  status: "DRAFT" | "ACTIVE" | "FINAL" | null;
  payer: Payer | null;
}

export interface Payer {
  id: string;
  type: PaymentType;
  name: string;
  city: string;
  email: string;
  country: string;
  billingAddress: string;
  organization?: string;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface InvoiceState {
  invoice: Invoice;
  payerLoading: LoadingState;
  invoiceLoading: LoadingState;
}
