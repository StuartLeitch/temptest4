// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GetInvoicesIdsResponse } from './getInvoicesIdsResponse';
import { GetInvoicesIdsErrors } from './getInvoicesIdsErrors';
import { GetInvoicesIdsDTO } from './getInvoicesIdsDTO';

export type GetInvoicesIdsContext = AuthorizationContext<Roles>;

export class GetInvoicesIdsUsecase
  implements
    UseCase<
      GetInvoicesIdsDTO,
      Promise<GetInvoicesIdsResponse>,
      GetInvoicesIdsContext
    >,
    AccessControlledUsecase<
      GetInvoicesIdsDTO,
      GetInvoicesIdsContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetInvoicesIdsDTO,
    context?: GetInvoicesIdsContext
  ): Promise<GetInvoicesIdsResponse> {
    return (right(
      Result.ok(this.getInvoiceIds(request))
    ) as unknown) as GetInvoicesIdsResponse;
  }

  private async *getInvoiceIds({ invoiceIds, journalIds }: GetInvoicesIdsDTO) {
    let page = 0;
    while (true) {
      const items = await this.invoiceRepo.getInvoicesIds(
        invoiceIds,
        journalIds,
        page
      );
      if (!items.length) {
        break;
      }
      page++;
      yield* items;
    }
  }
}
