import { Either } from '../../../../core/logic/Either';

import { PaymentClientToken } from '../../../PaymentClientToken';
import { ExternalOrderId } from '../../../external-order-id';

import * as Errors from './errors';

interface TransactionRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentMethodNonce: string;
  paymentTotal: number;
}

interface ServiceContract {
  createTransaction(
    request: TransactionRequest
  ): Promise<
    Either<Errors.UnexpectedError | Errors.UnsuccessfulSale, ExternalOrderId>
  >;
  generateClientToken(): Promise<
    Either<
      Errors.UnexpectedError | Errors.UnsuccessfulTokenGeneration,
      PaymentClientToken
    >
  >;
}

export {
  TransactionRequest as BraintreeTransactionRequest,
  ServiceContract as BraintreeServiceContract,
  Errors as BraintreeServiceErrors,
};
