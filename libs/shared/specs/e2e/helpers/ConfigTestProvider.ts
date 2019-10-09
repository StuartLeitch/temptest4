import * as Chai from 'chai';

import {JobContract} from '../../../lib/infrastructure/message-queues/contracts/Job';
import {QueueAdapterContract} from '../../../lib/infrastructure/message-queues/contracts/QueueAdapter';
import {ConfigContract} from '../../../lib/infrastructure/message-queues/contracts/Config';

export class ConfigTestProvider {
  public static testGetConcurrency(config: ConfigContract) {
    describe('#getConcurrency()', function() {
      it('check whether getConcurrency() returns the correct concurrency for given queues', function(done) {
        Chai.assert.equal(config.getConcurrency('default'), 1);
        Chai.assert.equal(config.getConcurrency('test_concurrency_1'), 1);
        Chai.assert.equal(config.getConcurrency('test_concurrency_2'), 2);

        done();
      });
    });
  }
}
