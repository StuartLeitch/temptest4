export interface CreatePaymentDTO {
  foreignPaymentId: string;
  authorizationCode: string;
  cardLastDigits: string;
  isFinalPayment: boolean;
  paymentMethodId: string;
  datePaid?: string;
  invoiceId: string;
  payerId: string;
  amount: number;
  status: string;
}
