import { JobData } from '@hindawi/sisif';
import { LoggerContract } from '@hindawi/shared';

export const emptyHandler = (
  payload: JobData,
  appContext: any,
  logger: LoggerContract
) => {
  throw Error(`Unhandled job type.`);
};
