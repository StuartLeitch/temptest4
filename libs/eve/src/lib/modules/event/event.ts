export interface Event {
  MessageAttributes: Record<string, any>;
  messageId: string;
  body: string;
}
