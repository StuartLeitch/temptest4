import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { ErrorUtils } from './../../../../../utils/ErrorUtils';

import {
  ErpInvoiceResponse,
  ErpServiceContract,
} from '../../../../../domain/services/ErpService';

import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { PublishCreditNoteToErpUsecase } from '../publishCreditNoteToErp/publishCreditNoteToErp';

import { RetryCreditNotesResponse as Response } from './retryCreditNotesResponse';
import { RetryCreditNotesDTO as DTO } from './retryCreditNotesDTO';

export class RetryCreditNotesUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  private publishCreditNoteToErpUsecase: PublishCreditNoteToErpUsecase;
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    this.publishCreditNoteToErpUsecase = new PublishCreditNoteToErpUsecase(
      this.invoiceRepo,
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo,
      this.erpReferenceRepo,
      this.erpService,
      this.loggerService
    );
  }

  public async execute(request?: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUnregisteredErpCreditNotesIds = await this.invoiceRepo.getUnregisteredErpCreditNotes();
      const registeredCreditNotes: ErpInvoiceResponse[] = [];

      if (maybeUnregisteredErpCreditNotesIds.isLeft()) {
        return left(
          new UnexpectedError(
            new Error(maybeUnregisteredErpCreditNotesIds.value.message)
          )
        );
      }

      const unregisteredErpCreditNotesIds =
        maybeUnregisteredErpCreditNotesIds.value;

      if (unregisteredErpCreditNotesIds.length === 0) {
        this.loggerService.info('No registered credit notes!');
        return right(registeredCreditNotes);
      }

      this.loggerService.info(
        `Retrying registration in NetSuite for credit notes: ${unregisteredErpCreditNotesIds
          .map((i) => i.id.toString())
          .join(', ')}`
      );
      const errs = [];

      for (const unregisteredCreditNote of unregisteredErpCreditNotesIds) {
        const publishedCreditNoteResponse = await this.publishCreditNoteToErpUsecase.execute(
          {
            creditNoteId: unregisteredCreditNote.id.toString(),
          }
        );
        if (publishedCreditNoteResponse.isLeft()) {
          errs.push(publishedCreditNoteResponse.value);
        } else {
          const assignedErpReference = publishedCreditNoteResponse.value;

          if (assignedErpReference === null) {
            // simply do nothing yet
          } else {
            this.loggerService.info(
              `CreditNote ${unregisteredCreditNote.id.toString()} successfully registered ${assignedErpReference}`
            );
            registeredCreditNotes.push(assignedErpReference);
          }
        }
      }

      if (errs.length > 0) {
        ErrorUtils.handleErpErrors(errs, this.loggerService);
        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(registeredCreditNotes);
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
