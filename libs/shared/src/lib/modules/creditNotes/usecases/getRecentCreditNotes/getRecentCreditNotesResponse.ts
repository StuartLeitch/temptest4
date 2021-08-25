import { Either } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as Errors from './getRecentCreditNotesErrors';
import { CreditNote } from '../../domain/CreditNote';

export interface GetRecentCreditNotesSuccessResponse {
  totalCount: string | number;
  creditNotes: CreditNote[];
}

export type GetRecentCreditNotesResponse = Either<
  Errors.CreditNotesListFailure | UnexpectedError | GuardFailure,
  GetRecentCreditNotesSuccessResponse
>;
