import { resolve } from 'path';

import { UnexpectedError, Either, right, left } from '@hindawi/shared';

import extract from "extract-zip";
import {Path} from "../../models/path";
import {ArchiveServiceContract} from "../contracts/archive-service-contract";

export class ArchiveService implements ArchiveServiceContract {
  async unzip(
    source: Path,
    target: Path
  ): Promise<Either<UnexpectedError, Path>> {
    try {
      const sourceSrc = resolve(source.src);
      const targetSrc = resolve(target.src);

      await extract(sourceSrc, { dir: targetSrc });
      return right(target);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
