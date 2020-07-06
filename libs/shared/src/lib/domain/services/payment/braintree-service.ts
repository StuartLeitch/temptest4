import { PaymentClientToken } from '../../../domain/PaymentClientToken';

interface TransactionResult {
  success: boolean;
  transaction: {
    status: string;
    type: string;
  };
}

interface TransactionRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentMethodNonce: string;
  paymentTotal: number;
}

interface Service {
  createTransaction(request: TransactionRequest): Promise<TransactionResult>;
  generateClientToken(): Promise<PaymentClientToken>;
}

export {
  TransactionRequest as BraintreeTransactionRequest,
  TransactionResult as BraintreeTransactionResult,
  Service as BraintreeService,
};
