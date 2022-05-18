import { PdfGeneratorService } from './PdfGenerator';
import type { InvoicePayload } from './PdfGenerator';
import { LoggerContract } from '../../../infrastructure/logging';

export { PdfGeneratorService, InvoicePayload };

export function createPdfGenerator(
  logger: LoggerContract
): PdfGeneratorService {
  const service = new PdfGeneratorService(logger);
  service.addTemplate('invoice', 'invoice.ejs');
  return service;
}
