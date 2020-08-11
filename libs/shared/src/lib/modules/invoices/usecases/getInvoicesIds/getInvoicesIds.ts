/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetInvoicesIdsResponse as Response } from './getInvoicesIdsResponse';
import { GetInvoicesIdsDTO as DTO } from './getInvoicesIdsDTO';
import * as Errors from './getInvoicesIdsErrors';

export class GetInvoicesIdsUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    try {
      let generator: AsyncGenerator<string, void, undefined>;
      try {
        generator = this.getInvoiceIds(request);
      } catch (err) {
        return left(new Errors.FilteringInvoicesDbError(err));
      }
      return right(Result.ok(generator));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async *getInvoiceIds({ invoiceIds, journalIds }: DTO) {
    const items = this.invoiceRepo.getInvoicesIds(invoiceIds, journalIds);
    yield* items;
  }
}
