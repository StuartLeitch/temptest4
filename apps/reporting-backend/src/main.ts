import { S3Bucket } from './s3/s3-bucket';
import { environment } from './environments/environment';

const s3Details = environment.s3BucketDetails;
const bucket = new S3Bucket(
  {
    ...s3Details,
    credentials: environment.credentials
  },
  console.log
);
bucket.getObjects();
