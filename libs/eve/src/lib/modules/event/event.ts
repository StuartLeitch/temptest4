export interface Event {
  attributes: {
    ApproximateFirstReceiveTimestamp: string;
    ApproximateReceiveCount: string;
    SentTimestamp: string;
    SenderId: string;
  };
  eventSourceARN: string;
  receiptHandle: string;
  eventSource: string;
  awsRegion: string;
  md5OfBody: string;
  messageId: string;
  body: string;
}
