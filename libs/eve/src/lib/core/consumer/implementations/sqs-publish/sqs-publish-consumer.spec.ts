import { cloneDeep } from 'lodash';

import { SqsPublishConsumer } from './sqs-publish-consumer';

interface MockEvent {
  messageId: string;
  body: string;
}

const mockEvents: MockEvent[] = [
  {
    messageId: '1',
    body: '{"a": "1"}'
  },
  {
    messageId: '2',
    body: '{"a": "2"}'
  },
  {
    messageId: '3',
    body: '{"a": "3"}'
  }
];

const mockQueue = 'rares-test';

let SQS;

describe('SQS publish event consumer test', () => {
  beforeEach(() => {
    const getQueueUrl = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        $response: {
          data: {
            QueueUrl: mockQueue
          }
        }
      })
    });
    const sendMessage = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue(null)
    });
    SQS = jest.fn().mockImplementation(() => ({
      getQueueUrl,
      sendMessage
    }));
  });

  it('should send the event to the correct sqs queue', async () => {
    const sqs = SQS();
    const consumer = new SqsPublishConsumer<MockEvent>(sqs, mockQueue);

    await consumer.consume(cloneDeep(mockEvents[0]));

    expect(sqs.sendMessage.mock.calls.length).toBe(1);
    expect(sqs.sendMessage.mock.calls[0][0].QueueUrl).toBe(mockQueue);
  });

  it('should send the event to sqs queue', async () => {
    const sqs = SQS();
    const consumer = new SqsPublishConsumer<MockEvent>(sqs, mockQueue);

    await consumer.consume(cloneDeep(mockEvents[0]));

    expect(sqs.sendMessage.mock.calls.length).toBe(1);
    expect(sqs.sendMessage.mock.calls[0][0].MessageBody).toBe(
      JSON.stringify(mockEvents[0])
    );
  });

  it('should send all the events to sqs queue', async () => {
    const sqs = SQS();
    const consumer = new SqsPublishConsumer<MockEvent>(sqs, mockQueue);

    await consumer.consume(cloneDeep(mockEvents));

    expect(sqs.sendMessage.mock.calls.length).toBe(mockEvents.length);
    expect(sqs.sendMessage.mock.calls[0][0].MessageBody).toBe(
      JSON.stringify(mockEvents[0])
    );
    expect(sqs.sendMessage.mock.calls[1][0].MessageBody).toBe(
      JSON.stringify(mockEvents[1])
    );
    expect(sqs.sendMessage.mock.calls[2][0].MessageBody).toBe(
      JSON.stringify(mockEvents[2])
    );
  });
});
