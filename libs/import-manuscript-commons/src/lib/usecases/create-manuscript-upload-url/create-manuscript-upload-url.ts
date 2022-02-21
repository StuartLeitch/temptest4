import {
  AccessControlledUsecase,
  AccessControlContext,
  UnexpectedError,
  LoggerContract,
  UseCase,
  left,
} from '@hindawi/shared';

import type { UsecaseAuthorizationContext as Context } from '../../authorization';
import { UploadServiceContract } from '../../services';
import { Authorize } from '../../authorization';

import { CreateManuscriptUploadUrlResponse as Response } from './create-manuscript-upload-url-response';
import { CreateManuscriptUploadUrlDTO as DTO } from './create-manuscript-upload-url-dto';

export class CreateManuscriptUploadUrlUseCase
  extends AccessControlledUsecase<string, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private readonly uploadService: UploadServiceContract,
    private readonly logger: LoggerContract
  ) {
    super();
  }

  @Authorize('manuscript:upload')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { fileName } = request;

    this.logger.debug(`Generating signed url for '${fileName}'`);

    try {
      const resp = await this.uploadService.createSignedUrlForUpload(fileName);

      return resp;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
