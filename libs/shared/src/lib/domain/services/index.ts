import {WaiverService} from './WaiverService';
import {VATService} from './VATService';

import {sqsConnection} from './sqs/connection';
import {SQSPublishService} from './sqs/PublishService';

const vatService = new VATService();
const waiverService = new WaiverService();
const publishService = new SQSPublishService(sqsConnection);

export {waiverService, vatService, publishService};
