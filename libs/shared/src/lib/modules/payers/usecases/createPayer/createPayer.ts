// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {AppError} from '../../../../core/logic/AppError';
import {CreatePayerErrors} from './createPayerErrors';
import {CreatePayerResponse} from './createPayerResponse';

import {PayerRepoContract} from '../../repos/payerRepo';
import {PayerMap} from '../../mapper/Payer';
import {Invoice} from '../../../invoices/domain/Invoice';
import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';
import {Payer} from '../../domain/Payer';
import {InvoiceId} from '../../../invoices/domain/InvoiceId';

export interface CreatePayerRequestDTO {
  invoiceId: string;
  name: string;
  surname: string;
  type: string;
}

export type CreatePayerContext = AuthorizationContext<Roles>;

export class CreatePayerUsecase
  implements
    UseCase<
      CreatePayerRequestDTO,
      Promise<CreatePayerResponse>,
      CreatePayerContext
    >,
    AccessControlledUsecase<
      CreatePayerRequestDTO,
      CreatePayerContext,
      AccessControlContext
    > {
  constructor(
    private payerRepo: PayerRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {
    this.payerRepo = payerRepo;
    this.invoiceRepo = invoiceRepo;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('transaction:update')
  public async execute(
    request: CreatePayerRequestDTO,
    context?: CreatePayerContext
  ): Promise<CreatePayerResponse> {
    const {name, surname, type, invoiceId} = request;
    let payer: Payer;
    let invoice: Invoice;

    try {
      try {
        invoice = await this.invoiceRepo.getInvoiceById(
          InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
        );
      } catch (err) {
        return left(new CreatePayerErrors.InvoiceNotFoundError(invoiceId));
      }

      payer = PayerMap.toDomain({name, surname, type});
      invoice.payerId = payer.payerId;

      await this.payerRepo.save(payer);

      return right(Result.ok<Payer>(payer));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
