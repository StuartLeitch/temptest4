export interface CreditCardInput {
  cardNumber: string;
  expiration: string;
  cvv: string;
  postalCode: string;
  paymentMethodId: string;
  invoiceId: string;
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
