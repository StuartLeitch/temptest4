import { cloneDeep } from 'lodash';

import { MockEvent } from '../modules/event';

import { MockProducer, EventsStore } from './producer';
import { MockConsumer } from './consumer';
import { MockSelector } from './selector';
import { MockFilter } from './filters';

const mockEvents: EventsStore = [
  {
    key: '1',
    value: {
      messageId: '1',
      body: '1'
    }
  },
  {
    key: '2',
    value: {
      messageId: '2',
      body: '2'
    }
  }
];

describe('core', () => {
  it('should move object from producer to consumer', async () => {
    const consumer = new MockConsumer();
    const producer = new MockProducer();
    const env: EventsStore = cloneDeep(mockEvents);
    const expectedOutput: MockEvent[] = [
      {
        messageId: '1',
        body: '1'
      },
      {
        messageId: '2',
        body: '2'
      }
    ];
    producer.from(cloneDeep(env));
    for await (const event of producer.produce()) {
      consumer.consume(event);
    }

    expect(consumer.output).toEqual(expectedOutput);
  });

  it('should move object that match the specified filters from producer to consumer', async () => {
    const consumer = new MockConsumer();
    const producer = new MockProducer();
    const filter = new MockFilter(['1']);
    producer.addFilter(filter);
    const env: EventsStore = cloneDeep(mockEvents);
    const predictedOutput = [
      {
        messageId: '1',
        body: '1'
      }
    ];
    producer.from(cloneDeep(env));
    for await (const event of producer.produce()) {
      consumer.consume(event);
    }

    expect(consumer.output).toEqual(predictedOutput);
  });

  it('should fetch objects that match the specified selector from producer to consumer', async () => {
    const producer = new MockProducer();
    const consumer = new MockConsumer();
    const selector = new MockSelector(['2']);
    const events = cloneDeep(mockEvents);
    const predictedOutput = [
      {
        messageId: '2',
        body: '2'
      }
    ];

    producer.addSelector(selector);
    producer.from(cloneDeep(events));
    for await (const event of producer.produce()) {
      consumer.consume(event);
    }

    expect(consumer.output).toEqual(predictedOutput);
  });
});
