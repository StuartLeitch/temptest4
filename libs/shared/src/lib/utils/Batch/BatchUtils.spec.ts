import { cloneDeep } from 'lodash';

import { BatchUtils } from './BatchUtils';

async function wait(ms: number): Promise<void> {
  return new Promise(res => {
    setTimeout(() => res(), ms);
  });
}

describe.only('batch utils', () => {
  describe('.withTimeout()', function() {
    it('triggers after timeout when length less than batch size', async function() {
      const mockFn = jest.fn();
      const timeout = 100;
      const debouncedCb = BatchUtils.withTimeout<Object>(mockFn, 10, timeout);
      debouncedCb([{}, {}]);
      expect(mockFn.mock.calls.length).toBe(0);
      await wait(timeout);
      expect(mockFn.mock.calls.length).toBe(1);
    });

    it('triggers twice when batch size exceeds', async function() {
      const mockFn = jest.fn();
      const timeout = 100;
      const debouncedCb = BatchUtils.withTimeout<number>(mockFn, 10, timeout);
      debouncedCb(new Array(11).fill(0));
      expect(mockFn.mock.calls.length).toBe(2);
      await wait(timeout);
      expect(mockFn.mock.calls.length).toBe(2);
    });

    it('triggers once when called a number of batch size times', async function() {
      const mockFn = jest.fn();
      const timeout = 100;
      const debouncedCb = BatchUtils.withTimeout<number>(mockFn, 10, timeout);
      for (let i = 0; i < 10; i++) {
        debouncedCb([i]);
      }
      expect(mockFn.mock.calls.length).toBe(1);
      await wait(timeout);
      expect(mockFn.mock.calls.length).toBe(1);
    });

    it('triggers once when called a number less than batch size', async function() {
      const mockFn = jest.fn();
      const timeout = 100;
      const debouncedCb = BatchUtils.withTimeout<number>(mockFn, 10, timeout);
      for (let i = 0; i < 9; i++) {
        debouncedCb([i]);
      }
      expect(mockFn.mock.calls.length).toBe(0);
      await wait(timeout);
      expect(mockFn.mock.calls.length).toBe(1);
    });
  });

  describe.only('.generatorWithTimeout()', async () => {
    it('should send all batches with batch size, if timeout is not met', async () => {
      const batchSize = 10;
      const timeout = 1000000;
      const callBack = jest.fn((arr: number[]) => {
        result.push(...arr);
      });
      const result: number[] = [];
      const batch: number[] = new Array(20).fill(1);
      const withTimeout = BatchUtils.generatorWithTimeout(
        callBack,
        batchSize,
        timeout
      );

      await withTimeout(toAsyncGenerator(cloneDeep(batch)));

      expect(result).toEqual(batch);
      expect(callBack.mock.calls.length).toBe(2);
      expect(callBack.mock.calls[0][0].length).toBe(batchSize);
      expect(callBack.mock.calls[1][0].length).toBe(batchSize);
    });
  });
});

async function* toAsyncGenerator<T>(
  arr: T[]
): AsyncGenerator<T, any, undefined> {
  for (const el of arr) {
    yield el;
  }
}
