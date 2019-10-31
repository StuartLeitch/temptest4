import streamToPromise from 'stream-to-promise';
import { InvoiceMap, PayerMap, ArticleMap, InvoiceStatus } from '@hindawi/shared';
import { PdfGeneratorService } from './PdfGenerator';
// import fs from 'fs';
// import path from 'path';

describe('PdfGeneratorService', () => {
  const generator = new PdfGeneratorService();
  generator.addTemplate('invoice', 'invoice.ejs');

  const invoice = InvoiceMap.toDomain({
    id: 'invoice-1',
    status: InvoiceStatus.DRAFT,
    invoiceNumber: 'invoice-1234',
    transactionId: 'transaction1',
    dateCreated: new Date(2019, 1, 2, 3, 4, 5, 1),
  });

  // const author = Author.create({
  //   name: 'Luke Skywalker'
  // }, new UniqueEntityID('author-1')).getValue();

  const article = ArticleMap.toDomain({
    id: 'article-1',
    title: 'Deathstart critical flaw whitepaper',
    articleTypeId: 'type1',
  });

  const payer = PayerMap.toDomain({
    id: 'payer-1',
    title: 'Dark Force',
    type: 'individual',
    name: 'Darth Vader',
    surname: 'Sith',
  });

  it('should generate an invoice', async () => {
    const stream = await generator.getInvoice({
      invoice,
      // author,
      article,
      payer
    });
    const buffer = await streamToPromise(stream);

    await expect(buffer).toMatchPdf('invoice-1');
  });
});
