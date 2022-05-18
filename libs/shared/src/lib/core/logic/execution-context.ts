import { NextFunction, Response, Request } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuid } from 'uuid';

const CORRELATION_ID_KEY = 'correlationId';

type Store = Map<string, unknown>;

class ExecutionContext {
  private localStorage: AsyncLocalStorage<Store>;

  get expressMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const baseStore = this.createBaseStore(req.body.correlationId);
      this.localStorage.run(baseStore, next);
    };
  }

  get correlationId(): string {
    return this.getValue(CORRELATION_ID_KEY) as string;
  }

  constructor() {
    this.localStorage = new AsyncLocalStorage();
  }

  private createBaseStore(id?: string): Store {
    const correlationId = id || uuid();

    const store = new Map();
    store.set(CORRELATION_ID_KEY, correlationId);

    return store;
  }

  startSession<T = Promise<void> | void>(f: () => T): T {
    const baseStore = this.createBaseStore();

    return this.localStorage.run(baseStore, f);
  }

  wrapAsyncQueueHandler<T>(f: (data: T) => Promise<void>) {
    return async (payload: T): Promise<void> => {
      const baseStore = this.createBaseStore(payload[CORRELATION_ID_KEY]);

      await this.localStorage.run(baseStore, f, payload);
    };
  }

  wrapSyncQueueHandler<T>(f: (data: T) => void) {
    return (payload: T): void => {
      const baseStore = this.createBaseStore(payload[CORRELATION_ID_KEY]);

      this.localStorage.run(baseStore, f, payload);
    };
  }

  getValue<T = unknown>(key: string): T | null {
    const store = this.localStorage.getStore();

    if (store && store.has(key)) {
      return store.get(key) as T;
    }

    return null;
  }

  setValue(key: string, value: unknown): void {
    const store = this.localStorage.getStore();

    if (store) {
      store.set(key, value);
    }
  }

  getAllValues(): Record<string, unknown> {
    const store = this.localStorage.getStore();

    const data = {};

    if (store) {
      for (const key of store.keys()) {
        data[key] = store.get(key);
      }
    }

    return data;
  }
}

export const executionContext = new ExecutionContext();
