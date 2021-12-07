export type Handler = (data: unknown) => Promise<void>;

export interface QueueConsumer<HandlerOptions> {
  registerHandler(handler: Handler, options?: HandlerOptions): void;
  start(): Promise<void>;
}
