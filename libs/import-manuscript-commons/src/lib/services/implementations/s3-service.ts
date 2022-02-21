import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { S3 } from 'aws-sdk';

import {
  UnexpectedError,
  eitherFromTry,
  AsyncEither,
  Either,
  right,
  left,
} from '@hindawi/shared';

import { ObjectStoreServiceContract } from '../contracts/object-store-service-contract';
import { Path } from '../../models/path';

export class S3Service implements ObjectStoreServiceContract {
  private s3: S3;

  constructor(
    private readonly bucketName: string,
    private readonly region: string,
    private readonly accessKeyId?: string,
    private readonly secretAccessKey?: string
  ) {
    let s3Option: S3.ClientConfiguration = {
      region: this.region,
    };

    if (this.secretAccessKey && this.accessKeyId) {
      s3Option = {
        region: this.region,
        credentials: {
          secretAccessKey: this.secretAccessKey,
          accessKeyId: this.accessKeyId,
        },
      };
    }

    this.s3 = new S3(s3Option);

    this.createS3Request = this.createS3Request.bind(this);
    this.downloadObject = this.downloadObject.bind(this);
  }

  async getObject(
    objectKey: string,
    target: Path
  ): Promise<Either<UnexpectedError, Path>> {
    try {
      const execution = await new AsyncEither(target)
        .chain(createContainingFolder)
        .chain(makeFilePath(target, objectKey))
        .map(this.createS3Request(objectKey))
        .chain(this.downloadObject)
        .execute();

      return execution;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private createS3Request(objectKey: string) {
    return (target: Path) => {
      const s3Request: S3.GetObjectRequest = {
        Bucket: this.bucketName,
        Key: objectKey,
      };

      return {
        s3Request,
        target,
      };
    };
  }

  private async downloadObject(request: {
    s3Request: S3.GetObjectRequest;
    target: Path;
  }): Promise<Either<UnexpectedError, Path>> {
    const s3Object = this.s3.getObject(request.s3Request).createReadStream();
    const targetFile = createWriteStream(request.target.src);

    try {
      await new Promise((resolve, reject) => {
        s3Object.pipe(targetFile);
        s3Object.on('error', (err) => reject(err));
        s3Object.on('end', () => resolve(null));
      });

      return right(request.target);
    } catch (err) {
      return left(new UnexpectedError(new Error(err)));
    }
  }
}

function makeFilePath(target: Path, objectKey: string) {
  return () => {
    const filePath = `${target.src}/${objectKey}`;

    return Path.create(filePath);
  };
}

async function createContainingFolder(
  path: Path
): Promise<Either<UnexpectedError, string>> {
  return eitherFromTry(mkdir(path.src, { recursive: true }));
}
