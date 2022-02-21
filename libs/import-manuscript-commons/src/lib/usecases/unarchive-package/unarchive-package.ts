import { access, unlink, rmdir } from 'fs/promises';
import { join as pathJoin } from 'path';
import { randomBytes } from 'crypto';

import {
  UnexpectedError,
  eitherFromTry,
  AsyncEither,
  UseCase,
  Either,
  left,
} from '@hindawi/shared';

import { ObjectStoreServiceContract } from '../../services/contracts/object-store-service-contract';
import { ArchiveServiceContract } from '../../services/contracts/archive-service-contract';
import { Path } from '../../models/path';

import type { UnarchivePackageResponse as Response } from './unarchive-package-response';
import type { UnarchivePackageDTO as DTO } from './unarchive-package-dto';

interface MovingPath {
  source: Path;
  target: Path;
}

export class UnarchivePackageUsecase
  implements UseCase<DTO, Promise<Response>, null> {
  constructor(
    private readonly objectStoreService: ObjectStoreServiceContract,
    private readonly archiveService: ArchiveServiceContract
  ) {
    this.downloadObject = this.downloadObject.bind(this);
    this.unzip = this.unzip.bind(this);
  }

  async execute(request: DTO): Promise<Response> {
    const folderName = `${request.name}-${getRandomHash()}`;
    const targetSrc = pathJoin(request.saveLocation, folderName);

    try {
      const maybeExtracted = await new AsyncEither(targetSrc)
        .chain(Path.create)
        .chain(this.downloadObject(request.name))
        .chain(this.unzip)
        .chain(deleteZip)
        .execute();

      return maybeExtracted;
    } catch (err) {
      await deleteContainingFolder(targetSrc);
      return left(
        new UnexpectedError(
          `While executing UnarchivePackageUsecase an error ocurred: ${err}`
        )
      );
    }
  }

  private downloadObject(fileName: string) {
    return async (target: Path) => {
      const maybeDownloaded = await this.objectStoreService.getObject(
        fileName,
        target
      );

      return maybeDownloaded.map((source) => ({ source, target }));
    };
  }

  private async unzip(
    request: MovingPath
  ): Promise<Either<UnexpectedError, { source: Path; target: Path }>> {
    const { source, target } = request;

    const maybeExtracted = await this.archiveService.unzip(source, target);

    return maybeExtracted.map(() => ({
      source,
      target,
    }));
  }
}

function getRandomHash(): string {
  const NumberOfBytes = 20;
  return randomBytes(NumberOfBytes).toString('hex');
}

async function deleteZip(
  request: MovingPath
): Promise<Either<UnexpectedError, Path>> {
  const maybeResult = await eitherFromTry(unlink(request.source.src));

  return maybeResult.map(() => request.target);
}

async function deleteContainingFolder(
  path: string
): Promise<Either<UnexpectedError, void>> {
  const verifyExistence = async (
    src: string
  ): Promise<Either<UnexpectedError, string>> => {
    const res = await eitherFromTry(access(src));

    return res.map(() => src);
  };

  const execution = await new AsyncEither(path)
    .chain(verifyExistence)
    .chain(async (src) => eitherFromTry(rmdir(src)))
    .execute();

  return execution;
}
