import { JobData } from '@hindawi/sisif';

import { Logger } from '../../lib/logger';

export const emptyHandler = (
  payload: JobData,
  appContext: any,
  logger: Logger
) => {
  throw Error(`Unhandled job type.`);
};
