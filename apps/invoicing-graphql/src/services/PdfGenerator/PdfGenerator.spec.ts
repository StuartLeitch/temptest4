import { Invoice, PayerName, PayerType, Payer, Author, Article, UniqueEntityID, InvoiceStatus } from '@hindawi/shared';
import { PdfGeneratorService } from './PdfGenerator';
import streamToPromise from 'stream-to-promise';
import fs from 'fs';
import path from 'path';

function writeSampleSnapshot(data: Buffer, fileName: string) {
  const snapshotDir = path.join(__dirname, '__snapshots__');
  fs.mkdirSync(snapshotDir, { recursive: true });
  const outFile = path.join(snapshotDir, fileName);

  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }

  fs.writeFileSync(outFile, data);
}

function stripDate(data: string): string {
  return data.replace(/CreationDate\s\(D:\d+\)/, '/CreationDate (D:20190102030405)');
}

describe('PdfGeneratorService', () => {
  const generator = new PdfGeneratorService();
  generator.addTemplate('invoice', 'invoice.ejs');

  const invoice = Invoice.create({
    status: InvoiceStatus.DRAFT,
    invoiceNumber: 'invoice-1234',
    // dateCreated: new Date(2019, 1, 2, 3, 4, 5, 1),
  }, new UniqueEntityID('invoice-1')).getValue();

  const author = Author.create({
    name: 'Luke Skywalker'
  }, new UniqueEntityID('author-1')).getValue();

  const article = Article.create({
    title: 'Deathstart critical flaw whitepaper',
    articleTypeId: 'type1',
  }, new UniqueEntityID('article-1')).getValue();

  const payer = Payer.create({
    type: PayerType.create('individual').getValue(),
    name: PayerName.create('Darth Vader').getValue(),
    surname: PayerName.create('Sith').getValue(),
  }, new UniqueEntityID('payer-1')).getValue();


  it('should generate an invoice', async () => {

    const stream = await generator.getInvoice({
      invoice,
      author,
      article,
      payer
    });
    const buffer = await streamToPromise(stream);

    process.env.DEBUG_PDF && writeSampleSnapshot(buffer, 'invoice.pdf');

    const data = stripDate(buffer.toString('utf-8'));

    expect(data).toMatchSnapshot();
  });
});
