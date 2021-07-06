// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CreditNoteId } from '../../domain/CreditNoteId';
import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteByIdResponse as Response } from './getCreditNoteByIdResponse';
import { GetCreditNoteByIdErrors as Errors } from './getCreditNoteByIdErrors';
import type { GetCreditNoteByIdDTO as DTO } from './getCreditNoteByIdDTO';

export class GetCreditNoteByIdUsecase
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

  @Authorize('read:credit_note')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    const { creditNoteId } = request;

    let creditNote: CreditNote;

    try {
      try {
        const maybeCreditNote = await this.creditNoteRepo.getCreditNoteById(
          CreditNoteId.create(new UniqueEntityID(creditNoteId))
        );

        if (maybeCreditNote.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeCreditNote.value.message))
          );
        }

        creditNote = maybeCreditNote.value;
      } catch (err) {
        return left(new Errors.CreditNoteNotFoundError(creditNoteId));
      }

      return right(creditNote);
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}
