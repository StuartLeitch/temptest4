// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlledUsecase, AccessControlContext } from '../../../../domain/authorization';

import { ManuscriptId } from './../../../manuscripts/domain/ManuscriptId';

import { ApplyWaiversDTO as DTO } from './applyWaiversDTO';
import { ApplyWaiversResponse as Response } from './applyWaiversResponse';
import * as Errors from './applyWaiversErrors';
import { LoggerContract } from '../../../../infrastructure/logging';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { WaiverRepoContract } from '../../../waivers/repos';
import { InvoiceItemRepoContract } from '../../repos';
import { InvoiceItem } from '../../domain/InvoiceItem';

export class ApplyWaiversUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private waiverRepo: WaiverRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private waiverService: WaiverService,
    private logger: LoggerContract
  ) {
    super();
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoiceItem: InvoiceItem;
    const manuscriptId = ManuscriptId.create(new UniqueEntityID(request.manuscriptId));
    try {
      try {
        // * System identifies invoice item by manuscript Id
        const maybeInvoiceItem = await this.invoiceItemRepo.getInvoiceItemByManuscriptId(manuscriptId);

        if (maybeInvoiceItem.isLeft()) {
          return left(new UnexpectedError(new Error(maybeInvoiceItem.value.message)));
        }

        invoiceItem = maybeInvoiceItem.value[0];
      } catch (err) {
        return left(new Errors.InvoiceItemNotFoundError(request.manuscriptId));
      }

      try {
        await this.waiverRepo.removeInvoiceItemWaivers(invoiceItem.invoiceItemId);
        await this.waiverService.applyWaiver({
          invoiceId: invoiceItem.invoiceId.id.toString(),
          allAuthorsEmails: request.authorsEmails,
          country: request.correspondingAuthorCountry,
          journalId: request.journalId,
        });
      } catch (error) {
        return left(
          new UnexpectedError(new Error(`Failed to save waiver due to error: ${error.message}: ${error.stack}`))
        );
      }

      return right(null);
    } catch (err) {
      this.logger.error(`An error occurred: ${err.value.message}`);
      return left(new UnexpectedError(err.value.message));
    }
  }
}
