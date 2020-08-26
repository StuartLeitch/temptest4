import { PdfGeneratorService } from './PdfGenerator';
import type { InvoicePayload } from './PdfGenerator';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

export { PdfGeneratorService, InvoicePayload };

let logger: LoggerContract;

export const pdfGeneratorService = new PdfGeneratorService(logger);

pdfGeneratorService.addTemplate('invoice', 'invoice.ejs');
