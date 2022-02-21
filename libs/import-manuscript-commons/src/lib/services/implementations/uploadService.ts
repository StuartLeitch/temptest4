import { VError } from 'verror';
import { S3 } from 'aws-sdk';

import { Either, Guard, right, left } from '@hindawi/shared';

import { UploadServiceContract } from '../contracts/uploadServiceContract';

//TODO add CORS the S3 bucket for additional security
export interface S3Configuration {
  secretAccessKey: string;
  accessKeyId: string;
  bucketName: string;
  region: string;
  signedUrlExpirationInSeconds: number;
}

export class S3UploadService implements UploadServiceContract {
  private readonly s3: S3;
  private readonly bucketName: string;
  private readonly expirationInSeconds: number;

  constructor(private readonly s3Config: S3Configuration) {
    validateConfig(s3Config);

    let s3Option: S3.ClientConfiguration = { region: this.s3Config.region };

    if (this.s3Config.secretAccessKey && this.s3Config.accessKeyId) {
      s3Option = {
        region: this.s3Config.region,
        credentials: {
          secretAccessKey: this.s3Config.secretAccessKey,
          accessKeyId: this.s3Config.accessKeyId,
        },
      };
    }

    this.s3 = new S3(s3Option);

    this.bucketName = this.s3Config.bucketName;
    this.expirationInSeconds = this.s3Config.signedUrlExpirationInSeconds;
  }

  async hasFileUploadedSuccessfully(
    fileName: string
  ): Promise<Either<Error, boolean>> {
    try {
      await this.s3
        .headObject({ Bucket: this.bucketName, Key: fileName })
        .promise();

      return right(true);
    } catch (err) {
      if (err.code === 'NotFound') {
        return right(false);
      }
      return left(createS3error(err, fileName));
    }
  }

  async createSignedUrlForUpload(
    fileName: string
  ): Promise<Either<Error, string>> {
    try {
      const signedUrl = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucketName,
        Key: fileName, //filename
        ContentType: 'application/zip',
        Expires: this.expirationInSeconds, //time to expire in seconds
      });

      return right(signedUrl);
    } catch (error) {
      return left(
        new VError(
          error,
          'An error occurred when creating a signed url for manuscript package upload'
        )
      );
    }
  }
}

function validateConfig(s3Config: S3Configuration): void {
  const guardResult = Guard.againstNullOrUndefinedBulk([
    { argument: s3Config.region, argumentName: 'region' },
    {
      argument: s3Config.signedUrlExpirationInSeconds,
      argumentName: 'signedUrlExpirationInSeconds',
    },
    { argument: s3Config.bucketName, argumentName: 'bucketName' },
  ]);

  if (guardResult.isFail()) {
    throw new VError(
      {
        name: 'S3_CONFIGURATION_ERROR',
      },
      guardResult.message
    );
  }
}

function createS3error(err, fileName: string): Error {
  return new VError(
    {
      name: 'AWS_S3_ERROR',
      cause: err,
    },
    "Exception occurred whilst checking import package existence in s3. bucket: '%s', file name: '%s'",
    this.bucketName,
    fileName
  );
}
