// import { PdfGeneratorService } from './PdfGenerator';
// import type { InvoicePayload } from './PdfGenerator';
// import { LoggerContract } from '../../../infrastructure/logging/Logger';

// export { PdfGeneratorService, InvoicePayload };

// export function createPdfGenerator(
//   logger: LoggerContract
// ): PdfGeneratorService {
//   const service = new PdfGeneratorService(logger);
//   service.addTemplate('invoice', 'invoice.ejs');
//   return service;
// }

import { PdfGeneratorService } from './weasyprint';
import type { InvoicePayload } from './weasyprint';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

export { PdfGeneratorService, InvoicePayload };

export function createPdfGenerator(
  logger: LoggerContract
): PdfGeneratorService {
  const service = new PdfGeneratorService(logger);
  service.addTemplate('invoice', 'invoice.ejs');
  return service;
}
