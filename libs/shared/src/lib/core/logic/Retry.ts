import { VError } from 'verror';

export type RetryFunction<T> = () => Promise<T> | T;

export const RetryOperation = Symbol('RetryOperation');

/**
 * The options object for the retry functionality
 * @param numberOfTries how many times the supplied function will be retied
 * @param exponentialBackOff if true each retry will wait longer than the
 * previous ones, using an exponentially increasing wait time
 * @param retryOnRequest when true the function will be retried only
 * when it throws the symbol RetryOperation, otherwise on each exception
 * the function will be retried
 * @param sleepTime specifies the wait time, in milliseconds, between retries,
 * in exponential mode this time will be multiplied with an exponentially
 * increasing progression, in linear mode it will always use this time to wait
 * between retries
 * @param maxBackOff specifies the maximum value of the backOff in exponential
 * mode, specified in milliseconds
 */
export type RetryOptions =
  | {
      exponentialBackOff: true;
      retryOnRequest: boolean;
      numberOfTries: number;
      maxBackOff?: number;
      sleepTime: number;
    }
  | {
      exponentialBackOff: false;
      retryOnRequest: boolean;
      numberOfTries: number;
      sleepTime: number;
    };

const defaultOptions: RetryOptions = {
  exponentialBackOff: true,
  retryOnRequest: false,
  numberOfTries: 5,
  maxBackOff: 1500,
  sleepTime: 100,
};

/**
 * Will retry a supplied function a number of times, according to the
 * provided options. If no attempts remain the function will throw the latest
 * error. If it succeeds the function will return what the supplied function
 * returns.
 * @param {RetryFunction} work the function to be retried
 * @param {RetryOptions} options contains all options that the retry function can support
 */
export async function retryWork<T>(work: RetryFunction<T>, options: RetryOptions = defaultOptions): Promise<T> {
  sanityChecks(options);

  let i = 1;

  while (true) {
    try {
      const response = await work();

      return response;
    } catch (error) {
      if (shouldStop(i, error, options)) {
        throw error;
      }

      await doSleep(i, options);

      i++;
    }
  }
}

async function doSleep(iteration: number, options: RetryOptions): Promise<void> {
  let sleepTime: number = options.sleepTime;

  if (options.exponentialBackOff) {
    sleepTime = exponentialTime(iteration, options.sleepTime, options.maxBackOff);
  }

  const sleep = new Promise((resolve) => setTimeout(resolve, sleepTime));

  await sleep;
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function exponentialTime(iteration: number, iterationBaseTime: number, maxBackOff?: number): number {
  const time = Math.pow(2, iteration);
  const jitter = randomIntFromInterval(1, 20);

  const totalSleepTime = time * iterationBaseTime + jitter;

  if (maxBackOff && maxBackOff > 0) {
    return Math.min(totalSleepTime, maxBackOff);
  }

  return totalSleepTime;
}

function sanityChecks(options: RetryOptions): void {
  if (options.numberOfTries <= 0) {
    throw new VError(`numberOfTries cannot be 0 or less`);
  }

  if (options.sleepTime <= 0) {
    throw new VError(`sleepTime cannot be 0 or less when using linear backOff`);
  }

  if (options.exponentialBackOff === true && options.maxBackOff && options.maxBackOff <= 0) {
    throw new VError(`maxBackOff cannot be 0 or less when provided`);
  }
}

function shouldStop(iteration: number, error: unknown, options: RetryOptions): boolean {
  if (iteration === options.numberOfTries) {
    return true;
  }

  if (options.retryOnRequest && error !== RetryOperation) {
    return true;
  }

  return false;
}
