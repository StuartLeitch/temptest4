import {
  ExtractManuscriptMetadataUseCase,
  UnarchivePackageUsecase,
  ValidatePackageUseCase,
  ValidatePackageEvent,
  ManuscriptMapper,
} from '@hindawi/import-manuscript-commons';

import { EventHandler } from './event-handler';
import { Context } from '../builders';

import { env } from '../env';

import { Logger } from '../libs/logger';
import { SubmitManuscriptUseCase } from '../../../../libs/import-manuscript-commons/src/lib/usecases/submit-manuscript/submit-manuscript';
import { VError } from 'verror';

const VALIDATE_PACKAGE = 'ValidatePackage';

export const ValidatePackageHandler: EventHandler<ValidatePackageEvent> = {
  event: VALIDATE_PACKAGE,
  handler(context: Context) {
    return async (data: ValidatePackageEvent) => {
      /*
        example of how the event looks on SQS:
        {
          "event": "ValidatePackage",
          "data": {
            "successContactEmail": "rares.stan@hindawi.com",
            "failContactEmail": "rares.stan@hindawi.com",
            "fileName": "test-bucket.zip"
          }
        }

        the data field contains the message that the handlers will receive, in this case this handler will receive the payload:

        {
          "successContactEmail": "rares.stan@hindawi.com",
          "failContactEmail": "rares.stan@hindawi.com",
          "fileName": "test-bucket.zip"
        }
      */

      const {
        services: {
          objectStoreService,
          archiveService,
          xmlService,
          reviewClient,
        },
        loggerBuilder,
      } = context;
      // const logger = loggerBuilder.getLogger();

      const logger = new Logger('validation-handler');

      const usecase = new UnarchivePackageUsecase(
        objectStoreService,
        archiveService
      );

      const res = await usecase.execute({
        saveLocation: env.zip.saveLocation,
        name: data.fileName,
      });

      if (res.isLeft()) {
        throw res.value;
      }

      logger.debug(`Package ${res.value.src} extracted`);
      const validateUsecase = new ValidatePackageUseCase(xmlService, logger);
      const extractManuscriptMetadataUseCase =
        new ExtractManuscriptMetadataUseCase(xmlService, logger);

      try {
        await validateUsecase.execute({
          definitionsPath: env.app.xmlDefinitionsLocation,
          packagePath: res.value.src,
        });

        logger.debug(`Package ${res.value.src} validated`);

        const manuscript = await extractManuscriptMetadataUseCase.execute({
          definitionsPath: env.app.xmlDefinitionsLocation,
          packagePath: res.value.src,
        });

        logger.info(
          JSON.stringify(ManuscriptMapper.toPersistance(manuscript), null, 2)
        );

        const envVars = env;

        const submissionEditURL = await new SubmitManuscriptUseCase(
          reviewClient,
          envVars
        ).execute({ manuscript, packagePath: res.value.src });
        logger.info(`Submission url ${submissionEditURL}`);

        context.services.emailService.sendEmail(
          [data.successContactEmail],
          'import-manuscript@hindawi.com',
          'Important Message',
          logger.messages
        );
      } catch (err) {
        context.services.emailService.sendEmail(
          [data.failContactEmail],
          'import-manuscript@hindawi.com',
          'Important Message',
          `ERROR processing package: ${err.message} ${err.stack}`
        );
        logger.error(err);
        throw new VError(err);
      }
    };
  },
};
