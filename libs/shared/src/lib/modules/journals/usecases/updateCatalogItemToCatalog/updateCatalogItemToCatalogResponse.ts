import { Either } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { CatalogItem } from '../../domain/CatalogItem';

import * as Errors from './updateCatalogItemToCatalogErrors';

export type UpdateCatalogItemToCatalogResponse = Either<
  Errors.PublisherNotFoundError | UnexpectedError,
  CatalogItem
>;
