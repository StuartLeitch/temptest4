import { PaymentClientToken } from '../../PaymentClientToken';
import { ExternalOrderId } from '../../external-order-id';

interface TransactionRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentMethodNonce: string;
  paymentTotal: number;
}

interface Service {
  createTransaction(request: TransactionRequest): Promise<ExternalOrderId>;
  generateClientToken(): Promise<PaymentClientToken>;
}

export {
  TransactionRequest as BraintreeTransactionRequest,
  Service as BraintreeServiceContract,
};
