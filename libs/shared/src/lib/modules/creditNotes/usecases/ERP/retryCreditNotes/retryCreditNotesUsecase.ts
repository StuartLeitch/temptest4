// * Authorization imports

import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

// * Core domain imports
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';
import { UseCase } from '../../../../../core/domain/UseCase';
import { right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { ErrorUtils } from '../../../../../utils/ErrorUtils';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { CreditNoteRepoContract } from '../../../repos/creditNoteRepo';
import { InvoiceRepoContract } from '../../../../invoices/repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../../invoices/repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { PublishCreditNoteToErpUsecase } from '../publishCreditNoteToErp/publishCreditNoteToErpUsecase';

import { RetryCreditNotesResponse as Response } from './retryCreditNotesResponse';

export class RetryCreditNotesUsecase
  extends AccessControlledUsecase<Record<string, unknown>, Context, AccessControlContext>
  implements UseCase<Record<string, unknown>, Promise<Response>, Context> {
  private publishCreditNoteToErpUsecase: PublishCreditNoteToErpUsecase;
  constructor(
    private creditNoteRepo: CreditNoteRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.publishCreditNoteToErpUsecase = new PublishCreditNoteToErpUsecase(
      this.creditNoteRepo,
      this.invoiceRepo,
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo,
      this.erpReferenceRepo,
      this.erpService,
      this.loggerService
    );
  }

  @Authorize('erp:publish')
  public async execute(request?: Record<string, unknown>, context?: Context): Promise<Response> {
    try {
      const maybeUnregisteredErpCreditNotesIds = await this.creditNoteRepo.getUnregisteredErpCreditNotes();
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
          },
          context
        );
        if (publishedCreditNoteResponse.isLeft()) {
          errs.push(publishedCreditNoteResponse.value);
        } else {
          const assignedErpReference = publishedCreditNoteResponse.value;

          if (assignedErpReference === null) {
            // no action
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
