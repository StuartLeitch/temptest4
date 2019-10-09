export abstract class BaseJsonRepo<T> {
  protected _items: T[];

  constructor() {
    this._items = [];
  }

  public setItem(t: T): void {
    let found = false;
    for (const item of this._items) {
      if (this.compareJsonItems(item, t)) {
        found = true;
      }
    }

    if (!found) {
      this._items.push(t);
    }
  }

  public deleteItem(t: T): void {
    this._items = this._items.filter(item => !this.compareJsonItems(item, t));
  }

  abstract compareJsonItems(a: T, b: T): boolean;
}
