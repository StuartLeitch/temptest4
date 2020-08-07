/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { PayerRepoContract } from '../../../payers/repos/payerRepo';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Payer } from '../../domain/Payer';

// * Usecase specific
import { GetPayerDetailsByInvoiceIdResponse as Response } from './getPayerDetailsByInvoiceIdResponse';
import { GetPayerDetailsByInvoiceIdErrors as Errors } from './getPayerDetailsByInvoiceIdErrors';
import { GetPayerDetailsByInvoiceIdDTO as DTO } from './getPayerDetailsByInvoiceIdDTO';

export class GetPayerDetailsByInvoiceIdUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract
  ) {
    this.validateRequest = this.validateRequest.bind(this);
    this.fetchPayer = this.fetchPayer.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.fetchPayer)
        .map((payer) => Result.ok<Payer>(payer));

      return execution.execute();
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
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
    const invoiceId = InvoiceId.create(uuid).getValue();

    try {
      const payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);

      if (!payer) {
        return left(new Errors.NoPayerFoundForInvoiceError(request.invoiceId));
      }

      return right(payer);
    } catch (e) {
      return left(new Errors.FetchPayerFromDbError(e));
    }
  }
}
