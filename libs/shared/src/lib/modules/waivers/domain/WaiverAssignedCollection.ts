import { WatchedList } from '../../../core/domain/WatchedList';

import { WaiverAssigned } from './WaiverAssigned';
import { Waiver } from './Waiver';

export class WaiverAssignedCollection extends WatchedList<WaiverAssigned> {
  get waivers(): Waiver[] {
    return this.currentItems.map((i) => i.waiver);
  }

  private constructor(initialList: WaiverAssigned[]) {
    super(initialList);
  }

  public static create(list?: WaiverAssigned[]): WaiverAssignedCollection {
    return new WaiverAssignedCollection(list ?? []);
  }

  public compareItems(a: WaiverAssigned, b: WaiverAssigned): boolean {
    return a.equals(b);
  }
}
