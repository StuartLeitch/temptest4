import { v4 as uuidv4 } from 'uuid';

import { Either, right, left } from '../../../../core/logic/Either';

import { PaymentClientToken } from '../../../PaymentClientToken';

import { ExternalOrderId } from '../../../../modules/payments/domain/external-order-id';

import {
  UnsuccessfulTokenGeneration,
  UnsuccessfulSale,
  UnexpectedError,
} from './errors';

import {
  BraintreeServiceContract,
  BraintreeTransactionRequest,
} from './service';

export class MockBraintreeService implements BraintreeServiceContract {
  async createTransaction(
    request: BraintreeTransactionRequest
  ): Promise<Either<UnsuccessfulSale | UnexpectedError, ExternalOrderId>> {
    if (!request.paymentMethodNonce) {
      return left(new UnsuccessfulSale('payer not existing'));
    }

    return right(ExternalOrderId.create(uuidv4()));
  }

  async generateClientToken(): Promise<
    Either<UnsuccessfulTokenGeneration | UnexpectedError, PaymentClientToken>
  > {
    return right(PaymentClientToken.create(uuidv4()).getValue());
  }
}
