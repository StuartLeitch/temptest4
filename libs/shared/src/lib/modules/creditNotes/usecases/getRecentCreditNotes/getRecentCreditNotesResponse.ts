import { Either, Result } from '../../../../core/logic/Result';
import { GetRecentCreditNotesErrors } from './getRecentCreditNotesErrors';
import { CreditNote } from '../../domain/CreditNote';

export interface GetRecentCreditNotesSuccessResponse {
  totalCount: string | number;
  creditNotes: CreditNote[];
}

export type GetRecentCreditNotesResponse = Either<
  GetRecentCreditNotesErrors.CreditNotesListFailure,
  Result<GetRecentCreditNotesSuccessResponse>
>;
