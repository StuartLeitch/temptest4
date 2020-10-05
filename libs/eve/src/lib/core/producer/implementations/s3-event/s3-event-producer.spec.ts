import { S3EventProducer } from './s3-event-producer';
import { Selector } from '../../../selector';
import { Filter } from '../../../filters';

interface MockEvent {
  MessageId: string;
  Message: string;
}

let S3;

const mockKeys = [
  {
    Key: '1',
  },
  {
    Key: '2',
  },
  {
    Key: '3',
  },
];

const mockObjects = {
  '1': `{"MessageId":"1","Message":"{'a':'1'}"}`,
  '2': `{"MessageId":"2","Message":"{'a':'2'}"}`,
  '3': `{"MessageId":"3","Message":"{'a':'3'}"}`,
};

class MockSelector implements Selector<string> {
  private acceptedKeys: string[];

  constructor(acceptedKeys: string[]) {
    this.acceptedKeys = acceptedKeys;
  }
  shouldSelect(key: string): boolean {
    return this.acceptedKeys.includes(key);
  }

  select(keys: string[]): string[] {
    return keys.filter(this.shouldSelect.bind(this));
  }
}

class MockFilter implements Filter<MockEvent> {
  private acceptedEvents: string[];

  constructor(acceptedEvents: string[]) {
    this.acceptedEvents = acceptedEvents;
  }

  match(event: MockEvent): boolean {
    return this.acceptedEvents.includes(event.MessageId);
  }
}

describe('S3 Event Producer', () => {
  beforeEach(() => {
    const s3ListObjectKeysV2 = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        IsTruncated: false,
        $response: {
          data: {
            Contents: mockKeys,
          },
        },
      }),
    });
    const s3GetObject = jest.fn(({ Key }) => {
      const values = mockObjects;
      return {
        promise: jest.fn().mockResolvedValue({
          $response: {
            data: {
              Message: values[Key],
            },
          },
        }),
      };
    });
    S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: s3ListObjectKeysV2,
      getObject: s3GetObject,
    }));
  });

  it('should get events from s3', async () => {
    const producer = new S3EventProducer(S3(), '');
    const list = producer.produce();
    const expectedResult = [
      { MessageId: '1', Message: "{'a':'1'}" },
      { MessageId: '2', Message: "{'a':'2'}" },
      { MessageId: '3', Message: "{'a':'3'}" },
    ];

    const results = [];
    for await (const event of list) {
      results.push(event);
    }
    expect(
      results.map((e) => ({ ...e, Message: e.Message.replace(' ', '') }))
    ).toEqual(
      expectedResult.map((e) => ({ ...e, Message: e.Message.replace(' ', '') }))
    );
  });

  it('should call getObjects only for the keys that match the selector', async () => {
    const s3 = S3();
    const producer = new S3EventProducer(s3, '');
    producer.addSelector(new MockSelector(['1', '3']));

    const list = producer.produce();

    const results = [];
    for await (const event of list) {
      results.push(event);
    }

    expect(s3.getObject.mock.calls[0][0].Key).toBe('1');
    expect(s3.getObject.mock.calls[1][0].Key).toBe('3');
  });

  it('should call getObjects only for the keys that match the selector', async () => {
    const s3 = S3();
    const producer = new S3EventProducer(s3, '');
    producer.addFilter(new MockFilter(['1', '3']));

    const list = producer.produce();
    const expectedResult = [
      { MessageId: '1', Message: "{'a':'1'}" },
      { MessageId: '3', Message: "{'a':'3'}" },
    ];

    const results = [];
    for await (const event of list) {
      results.push(event);
    }

    expect(
      results.map((e) => ({ ...e, Message: e.Message.replace(' ', '') }))
    ).toEqual(
      expectedResult.map((e) => ({ ...e, Message: e.Message.replace(' ', '') }))
    );
    expect(s3.getObject.mock.calls[0][0].Key).toBe('1');
    expect(s3.getObject.mock.calls[1][0].Key).toBe('2');
    expect(s3.getObject.mock.calls[2][0].Key).toBe('3');
  });
});
