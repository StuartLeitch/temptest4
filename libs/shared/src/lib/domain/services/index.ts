import { VATService } from './VATService';

import { sqsConnection } from './sqs/connection';
import { SQSPublishService } from './sqs/PublishService';

import { pdfGeneratorService } from './PdfGenerator';

const vatService = new VATService();
const publishService = new SQSPublishService(sqsConnection);

export { vatService, publishService, pdfGeneratorService };
