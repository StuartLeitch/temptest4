import { S3, AWSError } from 'aws-sdk';

export interface S3Credentials {
  secretAccessKey: string;
  accessKeyId: string;
}

export interface S3BucketParameters {
  credentials: S3Credentials;
  apiVersion: string;
  endpoint: string;
  name: string;
}

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

export type ObjectCallback = (data: Event) => void;

export class S3Bucket {
  private credentials: S3Credentials;
  private callback: ObjectCallback;
  private logger = console;
  private name: string;
  private api: S3;

  constructor(params: S3BucketParameters, callback: ObjectCallback) {
    this.credentials = params.credentials;
    this.name = params.name;
    this.api = new S3({
      ...this.credentials,
      endpoint: params.endpoint,
      apiVersion: params.apiVersion
    });
    this.callback = callback;
  }

  getObjects() {
    this.api.listObjectsV2({ Bucket: this.name }, (err, objects) => {
      if (err != null) {
        this.logger.error(err);
        return;
      }

      objects.Contents.forEach(this.processObject());
    });
  }

  private processObject() {
    return ({ Key }: S3.Object) => {
      this.api.getObject({ Bucket: this.name, Key }, (err, object) => {
        if (err != null) {
          this.logger.error(err);
          return;
        }

        let data: string;
        try {
          data = object.Body.toString();
        } catch {
          this.logger.error('[AWS] Object data cannot be decoded:', object);
        }

        this.processData(data);
      });
    };
  }

  private processData(data: string) {
    if (data == null) return;

    for (const entry of data.trim().split(/\s*[\r\n]+\s*/g)) {
      let json: Event;
      try {
        json = JSON.parse(entry.trim());
      } catch {
        this.logger.error(
          '[AWS] Object data cannot be JSON deserialized:',
          entry.trim()
        );
      }

      if (json != null) {
        this.callback(json);
      }
    }
  }
}
