import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

export type PublishInvoiceToErpResponse = Either<
  UnexpectedError,
  ErpInvoiceResponse
>;
