import { UnexpectedError, Either } from '@hindawi/shared';

import { Path } from '../../models/path';

export interface ObjectStoreServiceContract {
  getObject(
    objectKey: string,
    target: Path
  ): Promise<Either<UnexpectedError, Path>>;
}
