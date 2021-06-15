// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { PayerRepoContract } from '../../../payers/repos/payerRepo';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Payer } from '../../domain/Payer';

// * Usecase specific
import { GetPayerDetailsByInvoiceIdResponse as Response } from './getPayerDetailsByInvoiceIdResponse';
import { GetPayerDetailsByInvoiceIdDTO as DTO } from './getPayerDetailsByInvoiceIdDTO';
import * as Errors from './getPayerDetailsByInvoiceIdErrors';

export class GetPayerDetailsByInvoiceIdUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract
  ) {
    this.validateRequest = this.validateRequest.bind(this);
    this.fetchPayer = this.fetchPayer.bind(this);
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.fetchPayer)
        .execute();

      return execution;
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequiredError, DTO>> {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    return right(request);
  }

  private async fetchPayer(
    request: DTO
  ): Promise<
    Either<
      Errors.NoPayerFoundForInvoiceError | Errors.FetchPayerFromDbError,
      Payer
    >
  > {
    this.loggerService.info(
      `Fetching the payer associated to the invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);

    try {
      const payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);

      if (payer.isLeft()) {
        return left(new Errors.NoPayerFoundForInvoiceError(request.invoiceId));
      }

      return right(payer.value);
    } catch (e) {
      return left(new Errors.FetchPayerFromDbError(e));
    }
  }
}
