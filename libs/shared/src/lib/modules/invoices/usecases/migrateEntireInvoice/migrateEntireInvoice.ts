// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { MigrateEntireInvoiceResponse } from './migrateEntireInvoiceResponse';
import { MigrateEntireInvoiceErrors } from './migrateEntireInvoiceErrors';
import { MigrateEntireInvoiceDTO } from './migrateEntireInvoiceDTO';

import { validateRequest } from './utils';

export type MigrateEntireInvoiceContext = AuthorizationContext<Roles>;

export class MigrateEntireInvoiceUsecase
  implements
    UseCase<
      MigrateEntireInvoiceDTO,
      Promise<MigrateEntireInvoiceResponse>,
      MigrateEntireInvoiceContext
    >,
    AccessControlledUsecase<
      MigrateEntireInvoiceDTO,
      MigrateEntireInvoiceContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: MigrateEntireInvoiceDTO,
    context?: MigrateEntireInvoiceContext
  ): Promise<MigrateEntireInvoiceResponse> {
    const maybeRequest = validateRequest(request);
    return null;
  }
}
