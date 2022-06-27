import {
  AccessControlledUsecase,
  AccessControlContext,
  UnexpectedError,
  LoggerContract,
  GuardFailure,
  UseCase,
  left, GuardFail,
} from '@hindawi/shared';

import type { UsecaseAuthorizationContext as Context } from '../../authorization';
import { Authorize } from '../../authorization';

import { ManuscriptUploadInfoRepo } from '../../repo/implementations/manuscriptUploadInfoRepo';
import { UploadServiceContract } from '../../services';

import { CreateManuscriptUploadUrlResponse as Response } from './create-manuscript-upload-url-response';
import { CreateManuscriptUploadUrlDTO as DTO } from './create-manuscript-upload-url-dto';

const uuidLength = 36;
const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export class CreateManuscriptUploadUrlUseCase
  extends AccessControlledUsecase<string, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private readonly uploadService: UploadServiceContract,
    private readonly manuscriptUploadInfoRepo: ManuscriptUploadInfoRepo,
    private readonly logger: LoggerContract
  ) {
    super();
  }

  @Authorize('manuscript:upload')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { fileName } = request;

    this.logger.debug(`Generating signed url for '${fileName}'`);

    try {
      if (!fileName.endsWith('-meca.zip')) {
        return left(new GuardFail(`The package name is not valid`));
      }

      const uuid = fileName.substring(0, uuidLength);

      if (!uuidRegex.test(uuid)) {
        return left(new GuardFail(`The package name is not valid`));
      }

      const manuscriptExists =
        await this.manuscriptUploadInfoRepo.manuscriptExistsByName(fileName);

      if (manuscriptExists) {
        return left(new GuardFail(`This package was already imported`));
      }

      const resp = await this.uploadService.createSignedUrlForUpload(fileName);
      return resp;
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
