// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { CreditNoteId } from '../../domain/CreditNoteId';
import { CreditNote } from '../../domain/CreditNote';
import { CreditNoteRepoContract } from '../../repos/creditNoteRepo';

// * Usecase specific
import { GetCreditNoteByIdResponse } from './getCreditNoteByIdResponse';
import { GetCreditNoteByIdErrors } from './getCreditNoteByIdErrors';
import { GetCreditNoteByIdDTO } from './getCreditNoteByIdDTO';

export class GetCreditNoteByIdUsecase
  implements
    UseCase<
      GetCreditNoteByIdDTO,
      Promise<GetCreditNoteByIdResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetCreditNoteByIdDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private creditNoteRepo: CreditNoteRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetCreditNoteByIdDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetCreditNoteByIdResponse> {
    const { creditNoteId } = request;

    let creditNote: CreditNote;

    try {
      try {
        creditNote = await this.creditNoteRepo.getCreditNoteById(
          CreditNoteId.create(new UniqueEntityID(creditNoteId)).getValue()
        );
      } catch (err) {
        return left(
          new GetCreditNoteByIdErrors.CreditNoteNotFoundError(creditNoteId)
        );
      }

      return right(Result.ok<CreditNote>(creditNote));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
