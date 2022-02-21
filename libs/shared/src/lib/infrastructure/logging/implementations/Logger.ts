import { VError } from 'verror';
import winston from 'winston';
import * as path from 'path';

import { LoggerContract, LoggerOptions } from '../Logger';

/**
 * core.Log
 * ------------------------------------------------
 *
 * This is the main Logger Object. You can create a scope logger
 * or directly use the static log methods.
 *
 * By Default it uses the debug-adapter, but you are able to change
 * this in the start up process in the core/index.ts file.
 */

export class Logger implements LoggerContract {
  public static DEFAULT_SCOPE = 'Invoicing/Backend';
  private scope: string;
  private protocol: any;

  private static parsePathToScope(filePath: string): string {
    if (filePath.indexOf(path.sep) >= 0) {
      filePath = filePath.replace(process.cwd(), '');
      filePath = filePath.replace(`${path.sep}src${path.sep}`, '');
      filePath = filePath.replace(`${path.sep}dist${path.sep}`, '');
      filePath = filePath.replace('.ts', '');
      filePath = filePath.replace('.js', '');
      filePath = filePath.replace(path.sep, '/');
    }
    return filePath;
  }

  public setScope(scope?: string): void {
    this.scope = Logger.parsePathToScope(scope);
  }

  constructor(scope?: string, options: LoggerOptions = {}) {
    if (!scope) {
      this.scope = Logger.DEFAULT_SCOPE;
    } else {
      this.setScope(scope);
    }

    const customFormat = winston.format.printf((data) => {
      try {
        const { message, args, metadata, level, timestamp, label } = data;

        const { scope: metascope } = metadata;
        const justLevel = level.replace(
          // eslint-disable-next-line no-control-regex
          /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
          ''
        );

        const toShowArgs = args.length > 0;

        const isError =
          args.length > 0 &&
          args[0] &&
          Object.prototype.hasOwnProperty.call(args[0], 'error');
        const logLine = `[${timestamp}] [${justLevel}] ${
          metascope ? `[${metascope}] ` : ''
        }: ${message} ${toShowArgs && !isError ? JSON.stringify(args) : ''} ${
          isError
            ? `\x1b[31mError: ${args[0].error}\nStack: ${args[0].stack}\x1b[0m`
            : ''
        }`;

        return logLine;
      } catch (error) {
        console.log(error);
      }
    });

    const transport: winston.transport = new winston.transports.Console();

    const logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.colorize({
          all: true,
          colors: {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            debug: 'blueBG yellow',
            verbose: 'blueBG yellow',
          },
        }),
        winston.format.label({
          label: 'Maybe the correlation id and user id goes here',
        }),
        winston.format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss Z',
          alias: 'Date_alias',
        }),
        customFormat
      ),
      level: options.logLevel,
      transports: [transport],
    });

    this.protocol = logger;
  }

  public debug(message: any, ...args: any[]): void {
    this.log('debug', message, args);
  }

  public info(message: any, ...args: any[]): void {
    this.log('info', message, args);
  }

  public warn(message: any, ...args: any[]): void {
    this.log('warn', message, args);
  }

  public error(message: any, ...args: any[]): void {
    this.log('error', message, args);
  }

  private log(level: string, message: string, args: any[]): void {
    const metadata: Record<string, any> = { scope: this.scope };

    let newArgs = [];

    if (this.protocol) {
      if (args.length) {
        newArgs = args.map((arg) => {
          if (arg instanceof VError) {
            return {
              ...args,
              error: arg.message,
              stack: VError.fullStack(arg),
            };
          }
          if (arg instanceof Error) {
            return { ...args, error: arg.message, stack: arg.stack };
          }
          return args;
        });
      }

      this.protocol[level]({ message, args: newArgs, metadata });
    }
  }
}
