type PaymentType = "INDIVIDUAL" | "INSTITUTION";

export interface PayerInput {
  type: PaymentType;
  name: string;
  city: string;
  email: string;
  country: string;
  billingAddress: string;
  organization?: string;
}

export interface Payer extends PayerInput {
  id: string;
}

export interface PayerState {
  payer: Payer | PayerInput | null;
  loading: boolean;
  error: string;
}
