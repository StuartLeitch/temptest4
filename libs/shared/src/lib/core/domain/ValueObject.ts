import { isEqual } from 'lodash';

/**
 * @description ValueObjects are objects that we determine their
 * equality through their structural property.
 */

export interface ValueObjectProps {
  [key: string]: any;
}

export abstract class ValueObject<T extends Partial<ValueObjectProps>> {
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
    return isEqual(this.props, vo.props);
  }
}
