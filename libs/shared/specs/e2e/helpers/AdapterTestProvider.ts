import * as Chai from 'chai';

import {JobContract} from '../../../lib/infrastructure/message-queues/contracts/Job';
import {QueueAdapterContract} from '../../../lib/infrastructure/message-queues/contracts/QueueAdapter';

function randomInt(low: number, high: number) {
  return Math.floor(Math.random() * (high - low) + low);
}

var testNo = randomInt(0, 99);

export class AdapterTestProvider {
  public static testConcurrencies(
    adapterName: string,
    adapter: QueueAdapterContract
  ) {
    describe('Run generic integration test on: ' + adapterName, () => {
      describe('#check double concurrency', () => {
        it('check concurrency: 2', async () => {
          const {consumeCount, concurrency} = await this.testConcurrency(
            adapter,
            2,
            testNo
          );

          expect(consumeCount).toEqual(1);
          expect(concurrency).toEqual(2);
        }, 10000);
      });

      describe('#check single concurrency', () => {
        it('check concurrency: 1', async () => {
          const {consumeCount, concurrency} = await this.testConcurrency(
            adapter,
            1,
            testNo
          );

          expect(consumeCount).toEqual(1);
          expect(concurrency).toEqual(1);
        }, 10000);
      });
    });
  }

  private static async testConcurrency(
    adapter: QueueAdapterContract,
    concurrency: number,
    testNo: number
  ): Promise<any> {
    let noMessages = 1;
    let consumeCount = 0;
    let produceCount = 0;
    let currentConcurrency = 0;
    let maxConcurrency = 0;
    let queueName = 'test_concurrency_' + concurrency;
    let countDeliveries = {};

    return new Promise((resolve, reject) => {
      adapter.consume(queueName, function(job: JobContract) {
        // console.log('Run: ', queueName, ' Consume: ', job.getPayload());

        if (++currentConcurrency > maxConcurrency) {
          maxConcurrency = currentConcurrency;
        }

        countDeliveries[job.getPayload().value]++;

        setTimeout(async () => {
          // TODO: Fix await job.delete();

          ++consumeCount;
          --currentConcurrency;

          if (consumeCount === noMessages) {
            // console.log(
            //   'Run: ',
            //   queueName,
            //   ' Max Concurrency: ',
            //   maxConcurrency
            // );

            for (var key in countDeliveries) {
              if (countDeliveries[key] > 1) {
                // console.log(
                //   'Run: ',
                //   queueName,
                //   ' Delivered: {value:' +
                //     key +
                //     '} ' +
                //     countDeliveries[key] +
                //     ' times'
                // );
              }
            }
          }
          job.done();
          resolve({consumeCount, concurrency});
        }, 500);
      });

      let interval = setInterval(async () => {
        console.log('Run: ', queueName, ' Produce: ', {
          queueName: queueName,
          testNo: testNo,
          value: produceCount
        });

        try {
          await adapter.produce(queueName, {
            queueName: queueName,
            testNo: testNo,
            value: produceCount
          });
        } catch (error) {
          console.log(error);
        }

        if (++produceCount === noMessages) {
          clearInterval(interval);
        }
      }, 250);
    });
  }
}
