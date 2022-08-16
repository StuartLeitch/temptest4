import { Either } from '../../../../core/logic/Either';

import { PaymentClientToken } from '../../../PaymentClientToken';

import { ExternalOrderId } from '../../../../modules/payments/domain/external-order-id';

import {
  UnsuccessfulTokenGeneration,
  UnsuccessfulSale,
  UnexpectedError,
} from './errors';

interface TransactionRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentMethodNonce: string;
  paymentTotal: number;
}

interface TransactionResponse {
  externalOrderId: ExternalOrderId;
  authorizationCode: string;
  cardLastDigits: string;
}
interface ServiceContract {
  createTransaction(
    request: TransactionRequest
  ): Promise<Either<UnsuccessfulSale | UnexpectedError, TransactionResponse>>;
  generateClientToken(): Promise<
    Either<UnsuccessfulTokenGeneration | UnexpectedError, PaymentClientToken>
  >;
}

export {
  TransactionResponse as BraintreeTransactionResponse,
  TransactionRequest as BraintreeTransactionRequest,
  ServiceContract as BraintreeServiceContract,
};
