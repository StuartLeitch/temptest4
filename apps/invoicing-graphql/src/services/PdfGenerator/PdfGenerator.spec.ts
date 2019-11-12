import streamToPromise from 'stream-to-promise';

import {InvoiceStatus} from './../../../../../libs/shared/src/lib/modules/invoices/domain/Invoice';
import {InvoiceMap} from './../../../../../libs/shared/src/lib/modules/invoices/mappers/InvoiceMap';
import {AuthorMap} from './../../../../../libs/shared/src/lib/modules/authors/mappers/AuthorMap';
import {PayerMap} from './../../../../../libs/shared/src/lib/modules/payers/mapper/Payer';
import {PayerType} from './../../../../../libs/shared/src/lib/modules/payers/domain/Payer';
import {ArticleMap} from './../../../../../libs/shared/src/lib/modules/articles/mappers/ArticleMap';

import {PdfGeneratorService} from './PdfGenerator';

describe('PdfGeneratorService', () => {
  const generator = new PdfGeneratorService();
  generator.addTemplate('invoice', 'invoice.ejs');

  const invoice = InvoiceMap.toDomain({
    id: 'invoice-1',
    transactionId: 'transaction1',
    status: InvoiceStatus.DRAFT,
    invoiceNumber: 'invoice-1234',
    dateCreated: new Date(2019, 1, 2)
  });

  const author = AuthorMap.toDomain({
    id: 'author-1',
    name: 'Luke Skywalker'
  });

  const article = ArticleMap.toDomain({
    id: 'article-1',
    title: 'Death Star critical flaw white paper',
    articleTypeId: 'type1'
  });

  const payer = PayerMap.toDomain({
    id: 'payer-1',
    type: PayerType.INDIVIDUAL,
    name: 'Darth Vader'
  });

  it('should generate an invoice', async () => {
    const stream = await generator.getInvoice({
      invoice,
      author,
      article,
      payer
    });

    let buffer: Buffer;
    try {
      buffer = await streamToPromise(stream);
    } catch (e) {}

    (expect(buffer) as any).toMatchPdf('invoice-1');
  });
});
