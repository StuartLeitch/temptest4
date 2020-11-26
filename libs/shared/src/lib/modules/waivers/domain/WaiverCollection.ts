import { WatchedList } from '../../../core/domain/WatchedList';
import { Waiver } from './Waiver';

export class WaiverCollection extends WatchedList<Waiver> {
  private constructor(initialWaivers: Waiver[]) {
    super(initialWaivers);
  }

  public static create(waivers?: Waiver[]): WaiverCollection {
    return new WaiverCollection(waivers ?? []);
  }

  public compareItems(a: Waiver, b: Waiver): boolean {
    return a.equals(b);
  }
}
