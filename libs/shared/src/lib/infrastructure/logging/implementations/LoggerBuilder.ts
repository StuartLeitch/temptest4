import { VError } from 'verror';
import winston from 'winston';

import { executionContext } from '../../../core/logic';
import {
  LoggerBuilderContract,
  LoggerContract,
  LogLevel,
} from '../LoggerContract';

const formatter = winston.format;

function isErrorArgWinston(arg: Record<string, unknown>): boolean {
  return !!arg.error || !!arg.stack;
}

function not<T>(f: (v: T) => boolean) {
  return (v: T) => !f(v);
}

function prettyPrintLabel(key: string, val: unknown): string {
  return `${encodeURIComponent(key)}=${encodeURIComponent(val.toString())}`;
}

function formatLabels(metadata: Record<string, unknown>): string {
  // keys to be excluded that are being processed somewhere else and should not be part of the k=v part of the log
  const excludes = ['logger', 'stack', 'error', 'timestamp'];

  if (Object.entries(metadata).length === 0) {
    return '[]';
  }

  const labels = Object.entries(metadata)
    .filter(([key]) => !excludes.includes(key))
    .reduce((acc, [key, val]) => `${acc} ${prettyPrintLabel(key, val)}`, '')
    .trim();

  return `[${labels}]`;
}

function indentAllLinesButFirst(message: string, prefix = '  ') {
  return message.toString().replace(/\n/g, `\n${prefix}`);
}

function formatError(args: Array<Record<string, unknown>>) {
  return args
    .filter(isErrorArgWinston)
    .map((arg) => `\n${arg.stack || (<Error>arg.error).stack}`)
    .reduce((acc, line) => `${acc}${line}`, '');
}

function formatAdditionalArgs(args: Array<Record<string, unknown>>) {
  return args
    .filter(not(isErrorArgWinston))
    .map((arg) => JSON.stringify(arg))
    .reduce((acc, arg) => `${acc}\n${arg}`, '');
}

function messageFormatter(info: winston.Logform.TransformableInfo) {
  const labels = formatLabels(executionContext.getAllValues());
  const args = formatAdditionalArgs(info.metadata.args);
  const errors = formatError(info.metadata.args);
  const logger = info.metadata.logger ?? '-';

  const prefix = `${info.metadata.timestamp} ${info.level} ${logger}`;
  const suffix = `${args} ${errors}`;

  const log = `${prefix} ${labels} ${info.message} ${suffix}`;

  return indentAllLinesButFirst(log);
}

function initializeRootLogger(level?: LogLevel) {
  const rootLogger = winston.createLogger({
    format: winston.format.combine(
      formatter.timestamp(),
      formatter.errors({ stack: true }),
      formatter.metadata(),
      formatter.colorize(),
      formatter.printf(messageFormatter)
    ),
    transports: [new winston.transports.Console({ level: 'silly' })],
  });

  rootLogger.level = level || LogLevel.Info;

  return rootLogger;
}

const markErrorsInArgs = (arg: unknown) => {
  if (arg instanceof VError || arg instanceof Error) {
    return {
      stack: VError.fullStack(arg),
      error: arg,
    };
  }

  return arg;
};

export class Logger implements LoggerContract {
  public static DEFAULT_SCOPE = 'Invoicing/Backend';
  private protocol: winston.Logger;

  constructor(
    logLevel: LogLevel,
    private readonly scope: string = Logger.DEFAULT_SCOPE
  ) {
    this.protocol = initializeRootLogger(logLevel);
  }

  public debug(message: string, ...args: Array<unknown>): void {
    this.log('debug', message, args);
  }

  public info(message: string, ...args: Array<unknown>): void {
    this.log('info', message, args);
  }

  public warn(message: string, ...args: Array<unknown>): void {
    this.log('warn', message, args);
  }

  public error(message: string, ...args: Array<unknown>): void {
    this.log('error', message, args);
  }

  protected log(level: string, message: string, args: Array<unknown>): void {
    let newArgs = [];

    if (this.protocol) {
      if (args.length) {
        newArgs = args.map(markErrorsInArgs);
      }

      this.protocol.log(level, message, {
        logger: this.scope,
        scope: this.scope,
        args: newArgs,
      });
    }
  }
}

/**
 * The Concrete Builder classes follow the Builder interface and provide
 * specific implementations of the building steps. Your program may have several
 * variations of Builders, implemented differently.
 */
export class LoggerBuilder implements LoggerBuilderContract {
  constructor(private logLevel: LogLevel) {}

  public getLogger(scope: string): LoggerContract {
    return new Logger(this.logLevel, scope);
  }
}
