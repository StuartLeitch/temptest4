import { Event } from '../../event/event';
import { Output } from '../output';

export class MockOutput implements Output<Event> {
  private _output: Event[] = [];

  get output(): Event[] {
    return this._output;
  }

  write(event: Event): void {
    this._output.push(event);
  }
}
