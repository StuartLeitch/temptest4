import { Consumer } from '../consumer';
import { MockEvent } from '../../../modules/event';

export class MockConsumer implements Consumer<MockEvent> {
  private _output: MockEvent[] = [];

  get output(): MockEvent[] {
    return this._output;
  }

  consume(objects: MockEvent[] | MockEvent): void {
    if (Array.isArray(objects)) {
      for (const event of objects) {
        this._output.push(event);
      }
    } else {
      this._output.push(objects);
    }
  }
}
