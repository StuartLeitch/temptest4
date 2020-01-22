import { BatchUtils } from 'libs/shared/src/lib/utils/BatchUtils';
import { wait } from '../../utils/wait';

describe('BatchUtils', function() {
  describe('withTimeout', function() {
    it('triggers after timeout when length less than batch size', async function() {
      const mockFn = jest.fn();
      const timeout = 100;
      const debouncedCb = BatchUtils.withTimeout<Object>(mockFn, 10, timeout);
      debouncedCb([{}, {}]);
      expect(mockFn.mock.calls.length).toBe(0);
      await wait(100);
      expect(mockFn.mock.calls.length).toBe(1);
    });

    it('triggers twice when batch size exceeds', async function() {
      const mockFn = jest.fn();
      const timeout = 100;
      const debouncedCb = BatchUtils.withTimeout<number>(mockFn, 10, timeout);
      debouncedCb(new Array(11).fill(0));
      expect(mockFn.mock.calls.length).toBe(2);
      await wait(100);
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
      await wait(100);
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
      await wait(100);
      expect(mockFn.mock.calls.length).toBe(1);
    });
  });
});
