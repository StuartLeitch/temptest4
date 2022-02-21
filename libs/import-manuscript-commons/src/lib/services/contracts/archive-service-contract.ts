import { UnexpectedError, Either } from '@hindawi/shared';

import { Path } from '../../models/path';

export interface ArchiveServiceContract {
  unzip(source: Path, target: Path): Promise<Either<UnexpectedError, Path>>;
}
