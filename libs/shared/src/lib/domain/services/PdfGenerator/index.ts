import { PdfGeneratorService, InvoicePayload } from './PdfGenerator';

export { PdfGeneratorService, InvoicePayload };

export const pdfGeneratorService = new PdfGeneratorService();

pdfGeneratorService.addTemplate('invoice', 'invoice.ejs');
