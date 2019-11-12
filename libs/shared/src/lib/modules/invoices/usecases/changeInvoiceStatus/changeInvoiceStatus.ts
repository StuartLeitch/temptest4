// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {AppError} from '../../../../core/logic/AppError';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Result, left, right} from '../../../../core/logic/Result';

import {Invoice} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {InvoiceStatus} from '../../domain/Invoice';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';

import {ChangeInvoiceStatusResponse} from './changeInvoiceStatusResponse';

export interface ChangeInvoiceStatusRequestDTO {
  invoiceId: string;
  status: string;
}

export class ChangeInvoiceStatus
  implements
    UseCase<
      ChangeInvoiceStatusRequestDTO,
      Promise<ChangeInvoiceStatusResponse>
    > {
  constructor(private invoiceRepo: InvoiceRepoContract) {}

  public async execute(
    request: ChangeInvoiceStatusRequestDTO
  ): Promise<ChangeInvoiceStatusResponse> {
    try {
      const invoice = await this.invoiceRepo.getInvoiceById(
        InvoiceId.create(new UniqueEntityID(request.invoiceId)).getValue()
      );

      invoice.status = InvoiceStatus[request.status];
      await this.invoiceRepo.update(invoice);

      return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
