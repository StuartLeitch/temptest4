export interface CreditCardInput {
  amount: number;
  paymentMethodId: string;
  invoiceId: string;
  payerId: string;
  paymentMethodNonce: string;
  // cardNumber: string;
  // expiration: string;
  // cvv: string;
  // postalCode: string;
}

export interface ClientTokenInput {}
export interface ClientToken {
  token: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
  datePaid: Date;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PaymentsSlice {
  methods: PaymentMethod[];
  token: string;
}

export interface PayPalPayment {
  invoiceId: string;
  orderId: string;
}
