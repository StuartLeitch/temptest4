export type Handler = (data: unknown) => Promise<void>;

export interface QueueConsumer {
  registerHandler(event: string, handler: Handler): void;
  start(): Promise<void>;
}
