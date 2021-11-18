export interface Producer {
  sendEvent(
    data: unknown,
    event?: string,
    timestamp?: string,
    id?: string,
    messageAttributes?: Record<string, unknown>
  ): Promise<void>;
  start(): Promise<void>;
}
