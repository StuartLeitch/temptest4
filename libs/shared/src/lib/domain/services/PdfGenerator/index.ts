import { PdfGeneratorService } from './PdfGenerator';
import type { InvoicePayload, ReceiptPayload } from './PdfGenerator';
import { LoggerContract } from '../../../infrastructure/logging';

export { PdfGeneratorService, InvoicePayload, ReceiptPayload };

export function createPdfGenerator(
  logger: LoggerContract
): PdfGeneratorService {
  const service = new PdfGeneratorService(logger);
  service.addTemplate('invoice', 'invoice.ejs');
  service.addTemplate('receipt', 'receipt.ejs');
  return service;
}
