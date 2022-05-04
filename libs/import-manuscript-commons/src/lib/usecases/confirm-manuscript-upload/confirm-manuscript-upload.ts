import { SqsEventProducer } from '@hindawi/queue-utils';
import {
  AccessControlledUsecase,
  AccessControlContext,
  UnexpectedError,
  LoggerContract,
  UniqueEntityID,
  UseCase,
  right,
  left,
} from '@hindawi/shared';

import type { UsecaseAuthorizationContext as Context } from '../../authorization';
import { Authorize } from '../../authorization';

import { ValidatePackageEvent } from '../../queue/events/validate-package';
import { UploadServiceContract } from '../../services';
import {
  ManuscriptUploadInfo,
  ManuscriptStatus,
} from '../../models/manuscriptUploadInfo';

import { ManuscriptUploadInfoRepo } from '../../repo/implementations/manuscriptUploadInfoRepo';

import { ConfirmManuscriptUploadResponse as Response } from './confirm-manuscript-upload-response';
import { ConfirmManuscriptUploadDTO as DTO } from './confirm-manuscript-upload-dto';

export class ConfirmManuscriptUploadUseCase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private readonly manuscriptUploadInfoRepo: ManuscriptUploadInfoRepo,
    private readonly uploadService: UploadServiceContract,
    private readonly eventProducer: SqsEventProducer,
    private readonly logger: LoggerContract
  ) {
    super();
  }

  @Authorize('manuscript:upload')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { fileName } = request;

    this.logger.debug(`Confirming upload for '${fileName}'`);

    try {
      const maybeIsUploaded =
        await this.uploadService.hasFileUploadedSuccessfully(fileName);

      if (maybeIsUploaded.isLeft()) {
        return maybeIsUploaded.map(() => null);
      }

      if (!maybeIsUploaded.value) {
        this.logger.error(
          `The manuscript package, with filename "${fileName}", is not available in s3 bucket`
        );
        return left(createUploadFailError(fileName));
      }

      this.logger.debug(`Confirmed the existence of '${fileName}' in s3`);

      const eventName = 'ValidatePackage';
      const event: ValidatePackageEvent = {
        fileName,
        failContactEmail: request.failsEmail,
        successContactEmail: request.successEmail,
      };

      this.logger.debug(
        `Sending the begin validation event for '${fileName}'...`
      );

      const manuscriptUploadInfo = ManuscriptUploadInfo.create(
        {
          fileName,
          status: ManuscriptStatus.VALIDATION_STARTED,
          dateUpdated: new Date(),
          dateCreated: new Date(),
        },
        new UniqueEntityID()
      );
      await this.manuscriptUploadInfoRepo.persistManuscriptInfo(
        manuscriptUploadInfo
      );
      await this.eventProducer.sendEvent(event, eventName);

      this.logger.debug(
        `Sending the begin validation event for '${fileName}'... Done!`
      );

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}

function createUploadFailError(fileName: string): UnexpectedError {
  return new UnexpectedError(
    new Error(
      `The manuscript package file ${fileName} you are confirming is has not uploaded successfully`
    )
  );
}
