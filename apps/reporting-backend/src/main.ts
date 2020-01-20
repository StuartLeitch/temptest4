import { S3Bucket } from './s3/s3-bucket';
import { listEvents } from './s3/list-events';
import {environment} from './environments/environment';

const s3Details = environment.s3BucketDetails;

const bucket = new S3Bucket({
  ...s3Details,
  environment.credentials
});

listEvents(bucket, console.log);
