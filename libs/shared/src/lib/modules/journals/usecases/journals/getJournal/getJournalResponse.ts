import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { CatalogItem } from './../../../domain/CatalogItem';

import * as Errors from './getJournalErrors';

export type GetJournalResponse = Either<
  Errors.JournalDoesntExistError | UnexpectedError,
  CatalogItem
>;
