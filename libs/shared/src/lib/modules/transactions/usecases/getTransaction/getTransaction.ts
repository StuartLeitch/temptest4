// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../..//core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { TransactionId } from '../../domain/TransactionId';

import { TransactionRepoContract } from '../../repos/transactionRepo';

import { GetTransactionResponse as Response } from './getTransactionResponse';
import type { GetTransactionDTO as DTO } from './getTransactionDTO';

// * Authorization Logic

export class GetTransactionUsecase
  implements
    UseCase<DTO, Response, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private transactionRepo: TransactionRepoContract) {
    this.transactionRepo = transactionRepo;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const { transactionId } = request;

      if (!transactionId) {
        return left(
          new UnexpectedError(
            new Error(`Invalid Transaction id=${transactionId}`)
          )
        );
      }
      const maybeTransaction = await this.transactionRepo.getTransactionById(
        TransactionId.create(new UniqueEntityID(transactionId))
      );

      if (maybeTransaction.isRight()) {
        return right(maybeTransaction.value);
      } else {
        return left(
          new UnexpectedError(new Error(maybeTransaction.value.message))
        );
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
