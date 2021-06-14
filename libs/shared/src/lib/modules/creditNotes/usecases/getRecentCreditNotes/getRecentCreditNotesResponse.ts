import { Either, Result } from '../../../../core/logic/Result';

import { GetRecentCreditNotesErrors } from './getRecentCreditNotesErrors';

export type GetRecentCreditNotesResponse = Either<
  GetRecentCreditNotesErrors.CreditNotesListFailure,
  Result<any>
>;
