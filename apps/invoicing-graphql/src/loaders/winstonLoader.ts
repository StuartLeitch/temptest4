import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { configure, format, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

import { env } from '../env';

export const winstonLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  const {
    cloudwatch: { region, groupName, accessKey, secretAccessKey }
  } = env.log;
  const cloudwatchConfig: any = {
    logGroupName: groupName,
    logStreamName: `${groupName}-${env.node}`,
    awsAccessKeyId: accessKey,
    awsSecretKey: secretAccessKey,
    awsRegion: region,
    jsonMessage: true
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
