export interface Bundle<K, V> extends Iterable<[K, V]> {
  get(key: K): V;
  has(key: K): boolean;
  navigate(...keys: K[]): V;
  size: number;
}

export function JoinTag(value: Bundle<string | symbol, any>): string | symbol {
  switch (value.get(Symbol.for('outer'))) {
    case true:
      return 'fullOuterJoin';

    default:
      return 'join';
  }
}
