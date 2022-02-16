export type Handler = (data: unknown) => Promise<void>;

export interface QueueEventConsumer {
  registerHandler(eventName: string, handler: Handler): void;
  start(): Promise<void>;
}

export interface QueuePlainConsumer {
  registerHandler(handler: Handler): void;
  start(): Promise<void>;
}
