export interface AwsCredentials {
  secretAccessKey: string;
  accessKeyId: string;
}

export interface AwsConfig {
  credentials: AwsCredentials;
  apiVersion: string;
  bucketName: string;
  endpoint: string;
}
