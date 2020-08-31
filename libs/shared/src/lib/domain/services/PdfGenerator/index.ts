import { PdfGeneratorService } from './PdfGenerator';
import type { InvoicePayload } from './PdfGenerator';

export { PdfGeneratorService, InvoicePayload };

export const pdfGeneratorService = new PdfGeneratorService();

pdfGeneratorService.addTemplate('invoice', 'invoice.ejs');
