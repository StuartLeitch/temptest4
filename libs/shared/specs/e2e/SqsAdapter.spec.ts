import {JobContract} from '../../src/lib/infrastructure/message-queues/contracts/Job';
import {default as sqsAdapter} from './TestableSqsAdapter';
import {AdapterTestProvider} from './helpers/AdapterTestProvider';

xdescribe('SqsAdapter', function() {
  describe('#getQueueUrlPromise()', function() {
    it('returns a promise', async () => {
      const queueUrlPromise = sqsAdapter.getQueueUrlPromise('test');

      expect(queueUrlPromise).toBeInstanceOf(Promise);

      const queueUrl: string = await queueUrlPromise;
      expect(typeof queueUrl).toBe('string');
    });
  });

  describe('#consume()', function() {
    it('produces and consumes a job', async () => {
      const queueName = 'queueadapter_test_produce_and_consume';
      await sqsAdapter.produce(queueName, {hey: 'ho'});
      await sqsAdapter.consume(queueName, (job: JobContract) => {
        expect(job).toBeDefined();
        job.delete();
      });
    });
  });

  describe('#produce()', function() {
    it('produces a job', async () => {
      const queueName = 'queueadapter_test_produce';
      await sqsAdapter.produce(queueName, {hey: 'ho'});
    });
  });

  AdapterTestProvider.testConcurrencies('SqsAdapter', sqsAdapter);
});
