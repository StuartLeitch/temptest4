import { Context } from '../builders';

export type Chron = {
  name: string;
  schedule: (context: Context) => Promise<void>;
};
