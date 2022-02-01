import { UnexpectedError } from '../../../../.././core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { CatalogPaginated } from '../../../domain/CatalogPaginated';

export type GetJournalListResponse = Either<UnexpectedError, CatalogPaginated>;
