import { Either } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { CatalogItem } from '../../domain/CatalogItem';

import * as Errors from './updateCatalogItemFieldsErrors';

export type UpdateCatalogItemFieldsResponse = Either<
  Errors.CatalogNotFound | UnexpectedError,
  CatalogItem
>;
