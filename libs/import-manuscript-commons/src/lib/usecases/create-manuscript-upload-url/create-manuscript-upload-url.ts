import {
  AccessControlledUsecase,
  AccessControlContext,
  UnexpectedError,
  LoggerContract,
  UseCase,
  left, GuardFailure,
} from '@hindawi/shared';

import type { UsecaseAuthorizationContext as Context } from '../../authorization';
import { UploadServiceContract } from '../../services';
import { Authorize } from '../../authorization';

import { CreateManuscriptUploadUrlResponse as Response } from './create-manuscript-upload-url-response';
import { CreateManuscriptUploadUrlDTO as DTO } from './create-manuscript-upload-url-dto';
import {ManuscriptUploadInfoRepo} from "../../repo/implementations/manuscriptUploadInfoRepo";

export class CreateManuscriptUploadUrlUseCase
  extends AccessControlledUsecase<string, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
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
      if(!fileName.endsWith("-meca.zip")){
        return left(new GuardFailure(`Error: The package name is not valid`));
      }
      const uuidLenght = 36;
      const uuid = fileName.substr(0, uuidLenght);
      if(!/^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(uuid)){
        return left(new GuardFailure(`Error: The package name is not valid`));
      }
      const manuscriptExists = await this.manuscriptUploadInfoRepo.manuscriptExistsByName(fileName);
      if(manuscriptExists){
        return left(new GuardFailure(`Error: This package was already imported.`));
      } else {
        const resp = await this.uploadService.createSignedUrlForUpload(fileName);
        return resp;
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
