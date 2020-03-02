import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { configure, format, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

import { MessageFormat } from '../lib/logger/MessageFormat';
import { env } from '../env';

export const winstonLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  const {
    output,
    tenant,
    cloudwatch: { region, groupName, accessKey, secretAccessKey }
  } = env.log;
  console.log(
    `CloudWatch log stream is: ${output}-backend-${groupName}-${tenant}`
  );
  const cloudwatchConfig: any = {
    logGroupName: groupName,
    logStreamName: `${output}-backend-${groupName}-${tenant}`, // development-backend-invoicing-hindawi
    awsAccessKeyId: accessKey,
    awsSecretKey: secretAccessKey,
    awsRegion: region,
    jsonMessage: false,
    messageFormatter: MessageFormat.formatter
  };

  configure({
    transports: [
      new transports.Console({
        level: env.log.level,
        handleExceptions: true,
        format:
          env.node !== 'development'
            ? format.combine(format.json())
            : format.combine(format.colorize(), format.simple())
      }),
      new WinstonCloudWatch(cloudwatchConfig)
    ]
  });
};
