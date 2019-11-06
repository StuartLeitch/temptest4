import {WatchedList} from '../../../core/domain/WatchedList';

import {Editor} from './Editor';

export class Editors extends WatchedList<Editor> {
  private constructor(initialEditors: Editor[]) {
    super(initialEditors);
  }

  public static create(editors?: Editor[]): Editors {
    return new Editors(editors ? editors : []);
  }

  public compareItems(a: Editor, b: Editor): boolean {
    return a.equals(b);
  }
}
