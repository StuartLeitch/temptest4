import { readdir } from 'fs/promises';

import {
  ObjectStoreServiceContract,
  UnarchivePackageUsecase,
  ArchiveServiceContract,
  ValidatePackageEvent,
  EventHandler,
} from '@hindawi/import-manuscript-commons';

const VALIDATE_PACKAGE = 'ValidatePackage';

export const ValidatePackageHandler: EventHandler<ValidatePackageEvent> = {
  event: VALIDATE_PACKAGE,
  handler(
    objectStoreService: ObjectStoreServiceContract,
    archiveService: ArchiveServiceContract,
    zipLocation: string
  ) {
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

      const usecase = new UnarchivePackageUsecase(
        objectStoreService,
        archiveService
      );

      const res = await usecase.execute({
        saveLocation: zipLocation,
        name: data.fileName,
      });

      if (res.isLeft()) {
        throw res.value;
      }

      console.log('unzipped package in folder:', res.value.src);
      const files = await readdir(res.value.src);
      console.log('package contained these files:', files);
    };
  },
};
