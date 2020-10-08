export interface EventHandler<T> {
  handler: (data: T) => Promise<void>;
  event: string;
}
