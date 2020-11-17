// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import * as Errors from './getInvoicesByInvoiceNumber.errors';
import { GetInvoicesByInvoiceNumberDTO as DTO } from './getInvoicesByInvoiceNumber.dto';
import { GetInvoicesByInvoiceNumberResponse as Response } from './getInvoicesByInvoiceNumber.response';
import { InvoiceRepoContract } from '../../repos';

export class GetInvoicesByInvoiceNumberUsecase
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

  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    const { invoiceNumber } = request;

    try {
      const invoice = await this.invoiceRepo.getInvoicesByInvoiceNumber(
        invoiceNumber
      );
      if (!invoice) {
        return left(new Errors.InvoiceNotFoundError(invoiceNumber));
      }

      return right(invoice);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
