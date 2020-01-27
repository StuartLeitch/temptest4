import { S3EventProducer } from './s3-event-producer';

let S3;

const mockKeys = [
  {
    Key: '1'
  },
  {
    Key: '2'
  },
  {
    Key: '3'
  }
];

const mockObjects = {
  '1': `{"messageId":"1","body":"{'a':'1'}"}`,
  '2': `{"messageId":"2","body":"{'a':'2'}"}`,
  '3': `{"messageId":"3","body":"{'a':'3'}"}`
};

describe('S3 Event Producer', () => {
  beforeEach(() => {
    const s3ListObjectKeysV2 = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        IsTruncated: false,
        $response: {
          data: {
            Contents: mockKeys
          }
        }
      })
    });
    const s3GetObject = jest.fn(({ Key }) => {
      const values = mockObjects;
      return {
        promise: jest.fn().mockResolvedValue({
          $response: {
            data: {
              Body: values[Key]
            }
          }
        })
      };
    });
    S3 = jest.fn().mockImplementation(() => ({
      listObjectsV2: s3ListObjectKeysV2,
      getObject: s3GetObject
    }));
  });

  it('should get events from s3', async () => {
    const producer = new S3EventProducer('', S3());
    const list = producer.produce();
    const expectedResult = [
      { messageId: '1', body: "{'a':'1'}" },
      { messageId: '2', body: "{'a':'2'}" },
      { messageId: '3', body: "{'a':'3'}" }
    ];

    const results = [];
    for await (const event of list) {
      results.push(event);
    }
    expect(results.map(e => ({ ...e, body: e.body.replace(' ', '') }))).toEqual(
      expectedResult.map(e => ({ ...e, body: e.body.replace(' ', '') }))
    );
  });
});
