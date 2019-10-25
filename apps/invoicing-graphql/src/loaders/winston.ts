import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import {configure, format, transports} from 'winston';

import {environment} from '../environments/environment';

export const winstonLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  configure({
    transports: [
      new transports.Console({
        level: environment.log.level,
        handleExceptions: true,
        format:
          environment.node !== 'development'
            ? format.combine(format.json())
            : format.combine(format.colorize(), format.simple())
      })
    ]
  });
};
