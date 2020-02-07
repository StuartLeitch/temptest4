import isObject from "isobject";

export type Sequence<T> = Array<T> | Iterable<T> | IterableIterator<T>;

interface Bag<T> {
  add(value: T): this;
  has(value: T): boolean;
}

export function nonEmpty(object) {
  if (isObject(object))
    return Object.keys(object).length > 0;

  if (Array.isArray(object))
    return object.length > 0;

  return object != null;
}

export function toPath(array) {
  return `/${array.join('/')}`;
}

/**
 * This static class performs 'lean' object traversals, meaning that
 * each of its traversal functions only visit those values which are
 * 'non-empty' - as determined by invoking the `nonEmpty` function
 * upon them.
 */
export class LeanTraversal {
  static* deepTraverse(object) {
    if (object == null)
      return;

    yield* LeanTraversal._deepTraverse([], object);
  }

  static* _deepTraverse(path, here) {
    for (const [key, value] of Object.entries(here)) {
      if (nonEmpty(value)) {
        if (isObject(value)) {
          yield* LeanTraversal._deepTraverse([...path, key], value);
        } else {
          yield [[...path, key], value];
        }
      }
    }
  }
}

export class Categories<TItem, TToken> extends Map<TItem, TToken> {
  private _discarded: Bag<TToken>;

  constructor(source?: Sequence<Sequence<TItem>>, discarded?: Bag<TToken>) {
    super();
    this.update(source);
    this._discarded = discarded ?? new Set<TToken>();
  }

  update(source: Sequence<Sequence<TItem>>) {
    if (source == null)
      return false;

    for (const category of source) {
      this.add(category);
    }

    return true;
  }

  add(category: Sequence<TItem>) {
    if (category == null)
      return false;

    const token: any = Symbol();
    for (const item of category) {
      super.set(item, token);
    }

    return true;
  }

  get(item) {
    if (this.has(item))
      return super.get(item);
  }

  has(item) {
    if (!super.has(item))
      return false;

    const token = super.get(item);
    if (this.isDiscarded(token)) {
      super.delete(item);
      return false;
    }

    return true;
  }

  dropCategoryOf(item: TItem) {
    if (!super.has(item))
      return;

    const token = super.get(item);
    this._discard(token);
    return token;
  }

  isDiscarded(token: TToken) {
    return this._discarded.has(token);
  }

  _discard(token: TToken) {
    this._discarded.add(token);
  }
}

export class Cached {
  private readonly _cache: any[];
  private readonly _source: Sequence<any>;

  constructor(iterable) {
    this._cache = [];
    this._source = iterable;
  }

  * [Symbol.iterator]() {
    yield* this._cache;
    try {
      for (const item of this._source) {
        this._cache.push(item);
        yield item;
      }
    } catch (err) {
      // console.warn(err);
    }
  }
}
