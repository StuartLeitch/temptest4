import {
  AuthorizationContext,
  Roles,
  AccessControlledUsecase,
  AccessControlContext,
  InvoiceRepoContract,
  ErpResponse
} from '@hindawi/shared';
import { UseCase } from 'libs/shared/src/lib/core/domain/UseCase';
import {
  right,
  Result,
  left,
  Either
} from 'libs/shared/src/lib/core/logic/Result';
import { AppError } from 'libs/shared/src/lib/core/logic/AppError';
import { PublishInvoiceToErpUsecase } from '../publishInvoiceToErp/publishInvoiceToErp';

export interface RetryFailedErpInvoicesRequestDTO {}
export type RetryFailedErpInvoicesResponse = Either<
  AppError.UnexpectedError,
  Result<ErpResponse[]>
>;

export type RetryFailedErpInvoicesContext = AuthorizationContext<Roles>;

export class RetryFailedErpInvoicesUsecase
  implements
    UseCase<
      RetryFailedErpInvoicesRequestDTO,
      Promise<RetryFailedErpInvoicesResponse>,
      RetryFailedErpInvoicesContext
    >,
    AccessControlledUsecase<
      RetryFailedErpInvoicesRequestDTO,
      RetryFailedErpInvoicesContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private publishToErpUsecase: PublishInvoiceToErpUsecase
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request?: RetryFailedErpInvoicesRequestDTO,
    context?: RetryFailedErpInvoicesContext
  ): Promise<RetryFailedErpInvoicesResponse> {
    try {
      const failedErpInvoices = await this.invoiceRepo.getFailedErpInvoices();
      const updatedInvoices: ErpResponse[] = [];

      if (failedErpInvoices.length === 0) {
        console.log('No failed erp invoices');
        return right(Result.ok<ErpResponse[]>(updatedInvoices));
      }
      console.log(
        `Retrying sync with erp for invoices: ${failedErpInvoices
          .map(i => i.invoiceId.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const failedInvoice of failedErpInvoices) {
        const updatedInvoiceResponse = await this.publishToErpUsecase.execute({
          invoiceId: failedInvoice.invoiceId.id.toString()
        });
        if (updatedInvoiceResponse.isLeft()) {
          errs.push(updatedInvoiceResponse.value.error);
        } else {
          const assignedErpReference = updatedInvoiceResponse.value.getValue();
          console.log(
            `Assigned successfully ${
              assignedErpReference.tradeDocumentId
            } to invoice ${failedInvoice.invoiceId.id.toString()}`
          );
          updatedInvoices.push(assignedErpReference);
        }
      }

      if (errs.length > 0) {
        return left(new AppError.UnexpectedError(errs));
      }

      return right(Result.ok<ErpResponse[]>(updatedInvoices));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
