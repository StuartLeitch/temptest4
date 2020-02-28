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
    messageFormatter(log: any) {
      const { level, message, ...meta } = log;

      const messageFormat = {} as any;

      let scope = '';
      let rawMessage = '';
      const matches = message.match(/\[(.*?)\]\s+(.*)/);
      if (matches) {
        scope = matches[1];
        rawMessage = matches[2];
      }

      const scoping = scope.split(':');
      if (scoping[0] === 'PhenomEvent') {
        messageFormat.eventType = scoping[0];
        messageFormat.eventName = scoping[1];
        messageFormat.message = rawMessage;
      }

      if (scoping[0] === 'Usecase' && scoping[1] === 'Aspect') {
        messageFormat.usecase = meta.usecaseClassName;
        messageFormat.method = meta.usecaseMethodName;

        delete meta.usecaseClassName;
        delete meta.usecaseMethodName;
        // messageFormat.eventName = scoping[1];
        // messageFormat.message = rawMessage;
      }

      const _output = {
        level,
        context:
          'eventType' in messageFormat || 'usecase' in messageFormat
            ? {
                ...messageFormat
              }
            : { scope, message: rawMessage },
        data: 'args' in meta ? meta.args.request : meta
      };

      return JSON.stringify(_output);
    }
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
