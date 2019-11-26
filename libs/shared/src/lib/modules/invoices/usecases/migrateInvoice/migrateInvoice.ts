// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext
  // Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { Invoice } from './../../domain/Invoice';
import { InvoiceId } from './../../domain/InvoiceId';
import { InvoiceMap } from './../../mappers/InvoiceMap';

import { MigrateInvoiceResponse } from './migrateInvoiceResponse';
import { MigrateInvoiceErrors } from './migrateInvoiceErrors';
import { MigrateInvoiceDTO } from './migrateInvoiceDTO';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

export type MigrateInvoiceContext = AuthorizationContext<Roles>;

export class MigrateInvoiceUsecase
  implements
    UseCase<
      MigrateInvoiceDTO,
      Promise<MigrateInvoiceResponse>,
      MigrateInvoiceContext
    >,
    AccessControlledUsecase<
      MigrateInvoiceDTO,
      MigrateInvoiceContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  public async execute(
    request: MigrateInvoiceDTO,
    context?: MigrateInvoiceContext
  ): Promise<MigrateInvoiceResponse> {
    let invoice: Invoice;

    // * get a proper InvoiceId
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      try {
        // * System identifies invoice by id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new MigrateInvoiceErrors.InvoiceNotFound(invoiceId.id.toString())
        );
      }

      // await this.invoiceRepo.save(invoice);

      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
