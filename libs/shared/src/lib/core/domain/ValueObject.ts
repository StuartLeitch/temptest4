import {shallowEqual} from 'shallow-equal-object';

/**
 * @description ValueObjects are objects that we determine their
 * equality through their structural property.
 */

export abstract class ValueObject<T extends Partial<Record<string, any>>> {
  public readonly props: Readonly<T>;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return shallowEqual(this.props, vo.props);
  }
}
