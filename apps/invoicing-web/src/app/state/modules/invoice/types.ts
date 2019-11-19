type PaymentType = "INDIVIDUAL" | "INSTITUTION";

export interface Article {
  id: string;
  journalId: string;
  customId: string;
  title: string;
  articleType: string;
  authorEmail: string;
  authorCountry: string;
  authorSurname: string;
  authorFirstName: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  manuscriptId: string;
  price: number;
  article: Article;
}

export interface Invoice {
  id: string;
  status: "DRAFT" | "ACTIVE" | "FINAL" | null;
  payer: Payer | null;
  invoiceItems: InvoiceItem[] | [];
}

export interface Address {
  city: string;
  country: string;
  addressLine1: string;
}

export interface Payer {
  id: string;
  type: PaymentType;
  name: string;
  email: string;
  organization?: string;
  address: Address;
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
