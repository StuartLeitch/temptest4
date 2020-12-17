/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';
import { UseCase } from '../../../../../core/domain/UseCase';
import { right, Result, left, Either } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { InvoiceRepoContract } from '../../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../../repos/invoiceItemRepo';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { PublishCreditNoteToErpUsecase } from '../publishCreditNoteToErp/publishCreditNoteToErp';

export type RetryCreditNotesResponse = Either<
  UnexpectedError,
  Result<ErpInvoiceResponse[]>
>;

export class RetryCreditNotesUsecase
  implements
    UseCase<
      Record<string, unknown>,
      Promise<RetryCreditNotesResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      Record<string, unknown>,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
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

  private async getAccessControlContext(_request: any, _context?: any) {
    return {};
  }

  // @Authorize('zzz:zzz')
  public async execute(
    request?: Record<string, unknown>,
    context?: UsecaseAuthorizationContext
  ): Promise<RetryCreditNotesResponse> {
    try {
      const unregisteredErpCreditNotesIds = await this.invoiceRepo.getUnregisteredErpCreditNotes();
      const registeredCreditNotes: ErpInvoiceResponse[] = [];

      if (unregisteredErpCreditNotesIds.length === 0) {
        this.loggerService.info('No registered credit notes!');
        return right(Result.ok<ErpInvoiceResponse[]>(registeredCreditNotes));
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
        errs.forEach((err) => {
          if (typeof err === 'object' && err?.isAxiosError) {
            const errOut = {
              message: '',
              name: '',
              stack: '',
              config: '',
              details: '',
            };
            const errJSON = err.toJSON();
            if ('message' in errJSON) {
              errOut.message = errJSON.message;
            }
            if ('name' in errJSON) {
              errOut.name = errJSON.name;
            }
            if ('stack' in errJSON) {
              errOut.stack = errJSON.stack;
            }
            if ('config' in errJSON) {
              errOut.config = errJSON.config;
            }
            const details = err.response.data['o:errorDetails'];
            errOut.details = details;

            this.loggerService.error(errOut.message, errOut);
          } else {
            this.loggerService.error(err.error, err);
          }
        });

        return left(new UnexpectedError(errs, JSON.stringify(errs, null, 2)));
      }

      return right(Result.ok<ErpInvoiceResponse[]>(registeredCreditNotes));
    } catch (err) {
      this.loggerService.error(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
