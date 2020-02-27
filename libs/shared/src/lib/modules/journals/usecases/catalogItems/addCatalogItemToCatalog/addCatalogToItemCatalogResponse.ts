import { Either, Result } from '../../../../../core/logic/Result';
import { AppError } from '../../../../../core/logic/AppError';

import { AddCatalogItemToCatalogErrors } from './addCatalogItemToCatalogErrors';

export type AddCatalogItemToCatalogUseCaseResponse = Either<
  | AddCatalogItemToCatalogErrors.PublisherNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
