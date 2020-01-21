import { S3 } from 'aws-sdk';

export interface AwsCredentials {
  secretAccessKey: string;
  accessKeyId: string;
}

export interface AwsConfig {
  credentials: AwsCredentials;
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

function createS3(awsConfig: AwsConfig) {
  const { credentials, endpoint, apiVersion } = awsConfig;
  const s3 = new S3({
    endpoint,
    apiVersion,
    ...credentials
  });
  return s3;
}

export async function* eventsFromBucket(
  bucketName: string,
  awsConfig: AwsConfig
) {
  const s3 = createS3(awsConfig);
  const keys = getBucketKeys(s3, bucketName);

  for await (const key of keys) {
    const contents = await getObjectContents(s3, bucketName, key);
    yield* splitObjectIntoEvents(contents);
  }
}

async function* getBucketKeys(s3: S3, bucketName: string) {
  let lastKey: string = '';
  while (true) {
    const { isTruncated, objects } = await listObjects(s3, bucketName, lastKey);

    if (!objects) {
      break;
    }

    const keys = objects.Contents.map(obj => obj.Key);
    yield* keys;

    if (!isTruncated) {
      lastKey = keys[keys.length - 1];
      break;
    }
  }
}

async function listObjects(s3: S3, bucketName: string, startAfter: string) {
  const response = await s3
    .listObjectsV2({ Bucket: bucketName, StartAfter: startAfter })
    .promise();
  const data = response?.$response?.data;
  return { isTruncated: response.IsTruncated, objects: data };
}

async function getObjectContents(
  s3: S3,
  bucketName: string,
  key: string
): Promise<null | string> {
  const object = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
  const data = object?.$response?.data;
  if (!data) {
    return null;
  }
  return data.Body.toString();
}

function splitObjectIntoEvents(objectContent: string) {
  if (!objectContent) {
    return [];
  }

  const events = objectContent
    .trim()
    .split(/\s*[\r\n]+\s*/g)
    .map(line => extractEventData(line))
    .filter(event => !!event);

  return events;
}

function extractEventData(serializedEvent: string): Event | null {
  try {
    return JSON.parse(serializedEvent.trim());
  } catch {
    console.error(
      '[AWS] Object data cannot be JSON deserialized:',
      serializedEvent.trim()
    );
    return null;
  }
}
