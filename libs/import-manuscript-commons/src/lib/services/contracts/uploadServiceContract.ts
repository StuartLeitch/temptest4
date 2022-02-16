import { Either } from '@hindawi/shared';

export interface UploadServiceContract {
  createSignedUrlForUpload(fileName: string): Promise<Either<Error, string>>;
  hasFileUploadedSuccessfully(
    fileName: string
  ): Promise<Either<Error, boolean>>;
}
