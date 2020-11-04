import { Context } from '../builders';

export interface EventHandler<T> {
  handler: (context: Context) => HandlerFunction<T>;
  event: string;
}

export type HandlerFunction<T> = (data: T) => Promise<void>;
