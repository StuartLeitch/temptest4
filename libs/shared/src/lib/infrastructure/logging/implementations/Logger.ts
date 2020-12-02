/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as path from 'path';
import winston from 'winston';

import { LoggerContract } from '@hindawi/shared';
import { LoggerOptions } from '../Logger';

const { combine, splat, timestamp, colorize, printf } = winston.format;

const COLORS = {
  info: '\x1b[36m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  verbose: '\x1b[43m',
};

const LOG_ICONS: any = {
  debug: '🛠️',
  info: '\u{2139}',
  warn: '\u{26A0}',
  error: '\u{2757}',
  critical: '\u{203C}',
};

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

  public setProtocol(protocol: any): void {
    this.protocol = protocol;
  }

  constructor(scope?: string, options: LoggerOptions = {}) {
    if (!scope) {
      this.scope = Logger.DEFAULT_SCOPE;
    } else {
      this.setScope(scope);
    }

    const { logLevel = 'info', isDevelopment = true } = options;

    const consoleOptions = {
      handleExceptions: true,
      level: logLevel,
      format: null,
    };

    const customFormat = printf(({ message, args, metadata, level }) => {
      const { scope: metascope } = metadata;
      const justLevel = level.replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ''
      );

      const toShowArgs = args.length > 0;
      const isError = args.length > 0 && args[0] && args[0].name === 'error';
      return `${LOG_ICONS[justLevel]} ${
        metascope ? `[${metascope}] ` : ''
      } ➜ \x1b[37m${message} ${
        toShowArgs && !isError ? JSON.stringify(args) : ''
      } ${
        isError
          ? `${COLORS[justLevel]}Error: ${args[0].error}\nStack: ${args[0].stack}\x1b[0m`
          : ''
      }`;
    });

    if (logLevel === 'debug' && isDevelopment) {
      consoleOptions.format = combine(
        colorize({ all: true }),
        splat(),
        timestamp(),
        customFormat
      );
    }

    const transport: winston.transport = new winston.transports.Console(
      consoleOptions
    );

    const logger = winston.createLogger({
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
          if (arg instanceof Error) {
            return { ...arg, error: arg.message, stack: arg.stack };
          }
          return arg;
        });
      }
      this.protocol[level]({ message, args: newArgs, metadata });
    }
  }
}
