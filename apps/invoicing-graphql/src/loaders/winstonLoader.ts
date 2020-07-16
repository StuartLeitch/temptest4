/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

import { MessageFormat } from '../lib/logger/MessageFormat';
import { env } from '../env';

export const winstonLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  const {
    level,
    output,
    tenant,
    cloudwatch: { region, groupName, accessKey, secretAccessKey },
  } = env.log;
  winston.info(
    `CloudWatch log stream is: ${output}-backend-${groupName}-${tenant}`
  );
  const cloudwatchConfig: any = {
    level,
    logGroupName: groupName,
    logStreamName: `${output}-backend-${groupName}-${tenant}`, // development-backend-invoicing-hindawi
    awsAccessKeyId: accessKey,
    awsSecretKey: secretAccessKey,
    awsRegion: region,
    jsonMessage: false,
    messageFormatter: MessageFormat.formatter,
  };

  winston.add(new WinstonCloudWatch(cloudwatchConfig));
};
