import { Consumer } from '../consumer';
import { Output } from '../../output';
import { Event } from '../../event';

export class MockConsumer implements Consumer<Event> {
  private output: Output<Event>;

  constructor(output: Output<Event>) {
    this.output = output;
  }

  async consume(objects: AsyncGenerator<Event>): Promise<void> {
    for await (const event of objects) {
      this.output.write(event);
    }
  }
}
