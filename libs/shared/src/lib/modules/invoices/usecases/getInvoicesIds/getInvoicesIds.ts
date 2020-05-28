// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetInvoicesIdsResponse as Response } from './getInvoicesIdsResponse';
import { GetInvoicesIdsDTO as DTO } from './getInvoicesIdsDTO';
import * as Errors from './getInvoicesIdsErrors';

type Context = AuthorizationContext<Roles>;
export type GetInvoicesIdsContext = Context;

export class GetInvoicesIdsUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      let generator: AsyncGenerator<string, void, undefined>;
      try {
        generator = this.getInvoiceIds(request);
      } catch (err) {
        return left(new Errors.FilteringInvoicesDbError(err));
      }
      return right(Result.ok(generator));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }

  private async *getInvoiceIds({ invoiceIds, journalIds }: DTO) {
    const items = this.invoiceRepo.getInvoicesIds(invoiceIds, journalIds);
    yield* items;
  }
}
