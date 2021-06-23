// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left, right } from '../../../../core/logic/Either';
import { UnexpectedError } from 'libs/shared/src/lib/core/logic/AppError';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific

import type { GetCreditNoteByCustomIdDTO as DTO } from './getCreditNoteByCustomIdDTO';
import { GetCreditNoteByCustomIdResponse as Response } from './getCreditNoteByCustomIdResponse';
import { GetCreditNoteByCustomIdErrors as Errors } from './getCreditNoteByCustomIdErrors';

export class GetCreditNoteByCustomIdUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    const { customId } = request;

    let creditNote: CreditNote;

    try {
      const maybeCreditNote = await this.creditNoteRepo.getCreditNoteByCustomId(
        customId
      );
      if (maybeCreditNote.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCreditNote.value.message))
        );
      }

      creditNote = maybeCreditNote.value;
      return right(creditNote);
    } catch (e) {
      return left(new Errors.CreditNoteNotFoundError(customId));
    }
  }
}
