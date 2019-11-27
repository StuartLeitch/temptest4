export interface CreditCardInput {
  amount: number;
  cardNumber: string;
  expiration: string;
  cvv: string;
  postalCode: string;
  paymentMethodId: string;
  invoiceId: string;
  payerId: string;
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
}

export interface PayPalPayment {
  paymentMethodId: string;
  payPalOrderId: string;
  invoiceId: string;
  payerId: string;
}
