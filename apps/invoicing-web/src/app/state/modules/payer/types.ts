export interface PayerInput {
  paymentType: string;
  institution?: string;
  vat?: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city: string;
}

export interface Payer extends PayerInput {
  id: string;
}

export interface PayerState {
  payer: Payer | PayerInput | null;
  loading: boolean;
  error: string;
}
