export interface PublishMessage {
  messageAttributes?: Object;
  data: Object;
  timestamp?: string;
  event: string;
}
