type PaymentType = "INDIVIDUAL" | "INSTITUTION";

export interface Invoice {
  id: string;
  status: "DRAFT" | "ACTIVE" | "FINAL" | null;
  payer: Payer | null;
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

export interface CreditCardInput {
  cardNumber: string;
  expiration: string;
  cvv: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
  datePaid: Date;
}
