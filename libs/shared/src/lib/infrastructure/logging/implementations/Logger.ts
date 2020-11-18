/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as path from 'path';
import winston from 'winston';

import { LoggerContract } from '@hindawi/shared';
import { LoggerOptions } from '../Logger';

const logLevelIcons: any = {
  DEBUG: '\u{1F6E1}',
  INFO: '\u{2139}',
  WARNING: '\u{26A0}',
  ERROR: '\u{2757}',
  CRITICAL: '\u{203C}',
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

    let transport: winston.transport;
    const { logLevel = 'info', isDevelopment = false } = options;

    if (isDevelopment) {
      transport = new winston.transports.Console({
        handleExceptions: true,
        level: logLevel,
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple(),
          winston.format.printf(({ level, message, scope }) => {
            let printableMessage;
            if (typeof message === 'object') {
              printableMessage = JSON.stringify(message, undefined, 2);
            } else {
              printableMessage = message;
            }
            return `${scope ? `[${scope}] ` : ''}${level}: ${message}`;
          })
        ),
      });
    } else {
      transport = new winston.transports.Console({
        handleExceptions: true,
        level: logLevel,
      });
    }

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

  private formatScope(levelName: string, msg: string): string {
    return `${
      logLevelIcons[levelName.toUpperCase()]
    } [${levelName}]: \x1b[37m${msg}`;
  }
  private log(level: string, message: any, args: any[]): void {
    const formatter = this.formatScope(level, message);

    if (this.protocol) {
      const metadata: Record<string, any> = { scope: this.scope };
      if (args.length) {
        const newArgs = args.map((arg) => {
          if (arg instanceof Error) {
            return { ...arg, error: arg.message, stack: arg.stack };
          }
          return arg;
        });
        this.protocol[level]({ formatter, args: newArgs }, metadata);
      } else {
        this.protocol[level](formatter, metadata);
      }
    }
  }
}
