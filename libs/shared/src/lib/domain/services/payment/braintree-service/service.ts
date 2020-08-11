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

interface ServiceContract {
  createTransaction(
    request: TransactionRequest
  ): Promise<Either<UnsuccessfulSale | UnexpectedError, ExternalOrderId>>;
  generateClientToken(): Promise<
    Either<UnsuccessfulTokenGeneration | UnexpectedError, PaymentClientToken>
  >;
}

export {
  TransactionRequest as BraintreeTransactionRequest,
  ServiceContract as BraintreeServiceContract,
};
