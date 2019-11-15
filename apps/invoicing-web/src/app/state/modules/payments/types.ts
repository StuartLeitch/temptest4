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

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export interface PaymentsSlice {
  methods: PaymentMethod[];
}
