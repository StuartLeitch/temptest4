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
        services: { objectStoreService, archiveService, xmlService },
        loggerBuilder,
      } = context;
      const logger = loggerBuilder.getLogger();

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

      try {
        await validateUsecase.execute({
          definitionsPath: env.app.xmlDefinitionsLocation,
          packagePath: res.value.src,
        });
      } catch (err) {
        logger.error(err);
        throw err;
      }
      logger.debug(`Package ${res.value.src} validated`);

      const extractManuscriptMetadataUseCase =
        new ExtractManuscriptMetadataUseCase(xmlService, logger);

      try {
        const manuscript = await extractManuscriptMetadataUseCase.execute({
          definitionsPath: env.app.xmlDefinitionsLocation,
          packagePath: res.value.src,
        });

        logger.debug(
          JSON.stringify(ManuscriptMapper.toPersistance(manuscript), null, 2)
        );
      } catch (err) {
        logger.error(err);
        throw err;
      }
    };
  },
};
