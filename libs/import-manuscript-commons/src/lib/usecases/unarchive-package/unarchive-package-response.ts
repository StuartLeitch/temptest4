import { Either, UnexpectedError } from '@hindawi/shared';

import { Path } from '../../models/path';

export type UnarchivePackageResponse = Either<UnexpectedError, Path>;
