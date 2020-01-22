import { eve } from './eve';

import { cloneDeep } from 'lodash';

import { MockConsumer } from './modules/consumer';
import { MockProducer } from './modules/producer';
import { MockOutput } from './modules/output';
import { Event } from './modules/event';

describe('eve', () => {
  it('should work', () => {
    expect(eve()).toEqual('eve');
  });

  it('should move object from producer to consumer and in the output', async () => {
    const output = new MockOutput();
    const consumer = new MockConsumer(output);
    const producer = new MockProducer();
    const env: Event[] = [
      {
        messageId: '1',
        body: '1'
      },
      {
        messageId: '2',
        body: '2'
      }
    ];
    producer.produceFrom(cloneDeep(env));
    await consumer.consume(producer.getObjects());

    expect(output.output).toEqual(env);
  });
});
