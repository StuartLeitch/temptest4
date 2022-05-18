import { JobData } from '@hindawi/sisif';

export const emptyHandler = (payload: JobData, appContext: any) => {
  throw Error(`Unhandled job type.`);
};
