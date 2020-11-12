/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as path from 'path';
import winston from 'winston';

import { LoggerContract } from '@hindawi/shared';

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

  constructor(scope?: string) {
    if (!scope) {
      this.scope = Logger.DEFAULT_SCOPE;
    } else {
      this.setScope(scope);
    }

    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
        }),
      ],
    });
    this.protocol = logger;
  }

  public debug(message: string, ...args: any[]): void {
    this.log('debug', message, args);
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, args);
  }

  private log(level: string, message: string, args: any[]): void {
    if (this.protocol) {
      let metadata: Record<string, any> = { scope: this.scope };
      if (args.length) {
        let newArgs = args.map((arg) => {
          if (arg instanceof Error) {
            return { ...arg, error: arg.message, stack: arg.stack };
          }
          return arg;
        });
        this.protocol[level]({ message, args: newArgs }, metadata);
      } else {
        this.protocol[level](message, metadata);
      }
    }
  }
}
