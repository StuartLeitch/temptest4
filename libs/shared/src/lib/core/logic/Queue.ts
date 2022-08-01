export interface Queue<T> {
  size: number;
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peekEnd(): T;
  peek(): T;
}

export class ArrayQueue<T = unknown> implements Queue<T> {
  private readonly store: Array<T>;

  get size(): number {
    return this.store.length;
  }

  constructor() {
    this.store = [];
  }

  enqueue(item: T): void {
    this.store.push(item);
  }

  dequeue(): T {
    return this.store.shift();
  }

  peekEnd(): T {
    if (this.store.length === 0) {
      return undefined;
    }

    return this.store[this.store.length - 1];
  }

  peek(): T {
    return this.store[0];
  }
}
