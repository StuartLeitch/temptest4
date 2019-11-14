import {Either, Result} from '../../../../core/logic/Result';

import {GetInvoicePdfErrors} from './getInvoicePdfErrors';

export type GetInvoicePdfResponse = Either<GetInvoicePdfErrors, Result<Buffer>>;
