import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './existsManuscriptByIdErrors';

export type ExistsManuscriptByIdResponse = Either<
  | Errors.ManuscriptExistsByIdDbError
  | Errors.ManuscriptIdRequiredError
  | UnexpectedError,
  boolean
>;
