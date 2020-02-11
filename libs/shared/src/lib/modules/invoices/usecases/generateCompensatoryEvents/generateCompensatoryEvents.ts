// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// * Usecase specific
import { GenerateCompensatoryEventsResponse as Response } from './generateCompensatoryEventsResponse';
import { GenerateCompensatoryEventsErrors as Errors } from './generateCompensatoryEventsErrors';
import { GenerateCompensatoryEventsDTO as DTO } from './generateCompensatoryEventsDTO';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

type Context = AuthorizationContext<Roles>;
export type GenerateCompensatoryEventsContext = Context;

export class GenerateCompensatoryEventsUsecase
  implements
    UseCase<DTO, Promise<Response>, GenerateCompensatoryEventsContext>,
    AccessControlledUsecase<
      DTO,
      GenerateCompensatoryEventsContext,
      AccessControlContext
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: GenerateCompensatoryEventsContext
  ): Promise<Response> {
    const requestExecution = new AsyncEither<null, DTO>(request).then(
      this.verifyInput
    );

    return null;
  }

  private async verifyInput(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequired, DTO>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequired());
    }

    return right(request);
  }

  private async getInvoiceWithId(invoiceId: string) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const maybeResult = await usecase.execute({ invoiceId });
    return maybeResult.map(result => result.getValue());
  }
}
