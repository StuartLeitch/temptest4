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
  BraintreeTransactionResponse,
} from './service';

export class MockBraintreeService implements BraintreeServiceContract {
  async createTransaction(
    request: BraintreeTransactionRequest
  ): Promise<
    Either<UnsuccessfulSale | UnexpectedError, BraintreeTransactionResponse>
  > {
    if (!request.paymentMethodNonce) {
      return left(new UnsuccessfulSale('payer not existing'));
    }

    let transactionResponse: BraintreeTransactionResponse = {
      externalOrderId: ExternalOrderId.create(uuidv4()),
      authorizationCode: '3A2D34D',
      cardLastDigits: '1111',
    };
    return right(transactionResponse);
  }

  async generateClientToken(): Promise<
    Either<UnsuccessfulTokenGeneration | UnexpectedError, PaymentClientToken>
  > {
    const maybeClientToken = PaymentClientToken.create(uuidv4());

    if (maybeClientToken.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeClientToken.value.message))
      );
    }

    return right(maybeClientToken.value);
  }
}
