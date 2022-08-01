import { ArrayQueue, Queue } from './Queue';

type Resolver = (value: void) => void;

interface Awaiter {
  promise: Promise<void>;
  resolve: Resolver;
}

export class AsyncLock {
  private static readonly locks = new Map<string, Queue<Awaiter>>();

  private static initializeKey(key: string) {
    this.locks.set(key, new ArrayQueue<Awaiter>());
  }

  static acquire(key: string): Promise<void> {
    if (!this.locks.has(key)) {
      this.initializeKey(key);
    }

    const awaiter: Awaiter = {
      promise: null,
      resolve: null,
    };

    awaiter.promise = new Promise<void>(
      (resolve) => (awaiter.resolve = resolve)
    );

    const queue = this.locks.get(key);

    let retVal: Promise<void>;

    if (queue.size === 0) {
      retVal = Promise.resolve(null);
    } else {
      retVal = queue.peekEnd().promise;
    }

    queue.enqueue(awaiter);

    return retVal;
  }

  static release(key: string) {
    if (!this.locks.has(key) || this.locks.get(key).size === 0) {
      throw new Error(`There is no available lock for key ${key}`);
    }

    const awaiter = this.locks.get(key).dequeue();
    awaiter.resolve(null);
  }
}
