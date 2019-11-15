// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { PayerType } from '../../../payers/domain/PayerType';

import { Invoice } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { UpdatePayerUsecase } from '../../../payers/usecases/updatePayer/updatePayer';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

export interface UpdateInvoiceDetailsRequestDTO {
  invoiceId?: string;
  payerType?: string; // to map PayerType;
  name?: string;
}

export type UpdateInvoiceContext = AuthorizationContext<Roles>;

export class UpdateInvoiceDetailsUsecase
  implements
    UseCase<
      UpdateInvoiceDetailsRequestDTO,
      Result<Invoice>,
      UpdateInvoiceContext
    >,
    AccessControlledUsecase<
      UpdateInvoiceDetailsRequestDTO,
      UpdateInvoiceContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.payerRepo = payerRepo;
  }

  private async getInvoice(
    request: UpdateInvoiceDetailsRequestDTO
  ): Promise<Result<Invoice>> {
    const { invoiceId } = request;

    if (!invoiceId) {
      return Result.fail<Invoice>(`Invalid invoice id=${invoiceId}`);
    }

    const invoice = await this.invoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    const found = !!invoice;

    if (found) {
      return Result.ok<Invoice>(invoice);
    } else {
      return Result.fail<Invoice>(`Couldn't find invoice by id=${invoiceId}`);
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:update')
  public async execute(
    request: UpdateInvoiceDetailsRequestDTO,
    context?: UpdateInvoiceContext
  ): Promise<Result<Invoice>> {
    try {
      // * System looks-up the invoice
      const invoiceOrError = await this.getInvoice(request);

      if (invoiceOrError.isFailure) {
        return Result.fail<Invoice>(invoiceOrError.error);
      }

      const invoice = invoiceOrError.getValue();

      // * This is where all the magic happens
      const { payerType, name } = request;

      // * If "payerType" is defined, update payer
      if (payerType) {
        const updatePayerUsecase = new UpdatePayerUsecase(this.payerRepo);
        const updatePayer = await updatePayerUsecase.execute(
          {
            name,
            email: '',
            addressId: ''
          },
          context
        );

        if (updatePayer.value.isFailure) {
          return Result.fail<Invoice>(updatePayer.value.error);
        }
      }

      await this.invoiceRepo.update(invoice);

      return Result.ok<Invoice>(invoice);
    } catch (err) {
      console.log(err);
      return Result.fail<Invoice>(err);
    }
  }
}
