import { cloneDeep } from 'lodash';

import { MockConsumer } from './mock-consumer';

describe('mock-consumer', () => {
  it('should consume an array', () => {
    const consumer = new MockConsumer();
    const events = [
      {
        messageId: '1',
        body: '1'
      },
      {
        messageId: '2',
        body: '2'
      }
    ];
    consumer.consume(events);
    expect(consumer.output).toEqual(cloneDeep(events));
  });

  it('should consume a single value', () => {
    const consumer = new MockConsumer();
    const event = {
      messageId: '1',
      body: '1'
    };
    consumer.consume(event);
    expect(consumer.output).toEqual([cloneDeep(event)]);
  });
});
