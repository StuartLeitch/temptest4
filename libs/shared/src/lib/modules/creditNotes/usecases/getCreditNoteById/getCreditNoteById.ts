// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
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
import * as Errors from './getCreditNoteByIdErrors';
import type { GetCreditNoteByIdDTO as DTO } from './getCreditNoteByIdDTO';

export class GetCreditNoteByIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {
    super();
  }

  @Authorize('creditNote:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
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
