import { eventsFromBucket } from './events-store/get-events';
import { environment } from './environments/environment';

const s3Details = environment.s3BucketDetails;
async function main() {
  const awsConfig = {
    ...s3Details,
    credentials: environment.credentials
  };
  const bucketName = s3Details.name;
  for await (const event of eventsFromBucket(bucketName, awsConfig)) {
    console.log(event);
  }
}

main();
