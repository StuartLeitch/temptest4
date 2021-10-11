export interface Producer {
  sendEvent(
    event: string,
    data: unknown,
    timestamp: string,
    id: string
  ): Promise<void>;
  start(): Promise<void>;
}
