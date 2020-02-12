import { WatchedList } from '../../../../shared/src/lib/core/domain/WatchedList';
import { Constraint } from './Constraint';

export class Constraints extends WatchedList<Constraint> {
  private constructor(initial: Constraint[]) {
    super(initial);
  }

  public static create(constraints?: Constraint[]): Constraints {
    return new Constraints(constraints ? constraints : []);
  }

  public compareItems(a: Constraint, b: Constraint): boolean {
    return a.equals(b);
  }
}
