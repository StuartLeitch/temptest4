import countryList from 'country-list';
import stateList from 'state-list';
import { format } from 'date-fns';
import puppeteer from 'puppeteer';
import { Readable } from 'stream';
import axios from 'axios';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';
import { env } from 'process';

import { LoggerContract } from '../../../infrastructure/logging';

import { Article } from '../../../modules/manuscripts/domain/Article';
import { Address } from '../../../modules/addresses/domain/Address';
import { Invoice } from '../../../modules/invoices/domain/Invoice';
import { Author } from '../../../modules/authors/domain/Author';
import { Payer } from '../../../modules/payers/domain/Payer';
import { COUNTRY_CODES } from './types';

import { FormatUtils } from '../../../utils/FormatUtils';
import { Payment } from '../../../modules/payments/domain/Payment';

export interface InvoicePayload {
  invoiceLink: string;
  address: Address;
  article: Article;
  invoice: Invoice;
  author: Author;
  payer: Payer;
}

export interface ReceiptPayload {
  receiptLink: string;
  address: Address;
  article: Article;
  invoice: Invoice;
  author: Author;
  payer: Payer;
  payment: Payment;
}

export class PdfGeneratorService {
  constructor(private logger: LoggerContract) {}
  private templates: {
    [key: string]: {
      fileName: string;
      compile?: ejs.TemplateFunction;
    };
  } = {};

  public async getReceipt(payload: ReceiptPayload): Promise<Readable> {
    var { imgType, logoData } = await convertLogoType(process.env.LOGO_URL);
    const { page, browser } = await createNewPage();

    const template = this.getTemplate('receipt');

    const {
      address: { country },
    } = payload;

    const data = {
      formatPriceFn: FormatUtils.formatPrice,
      dateFormatFn: format,
      ...payload,
      addressCountry: getCountry(country),
      addressState: stateList.name[payload.address.state],
      companyNumber: process.env.COMPANY_REGISTRATION_NUMBER,
      vatNumber: process.env.COMPANY_VAT_NUMBER,
      assistanceEmail: process.env.ASSISTANCE_EMAIL,
      tenantAddress: process.env.TENANT_ADDRESS,
      companyName: process.env.COMPANY_NAME,
      logo: `data:image/${imgType};base64, ${logoData}`,
    };

    const htmlTemplate = template(data);

    try {
      return await generatePdf(page, htmlTemplate);
    } catch (error) {
      this.logger.error(error.message, error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  public async getInvoice(payload: InvoicePayload): Promise<Readable> {
    var { imgType, logoData } = await convertLogoType(process.env.LOGO_URL);
    const { page, browser } = await createNewPage();

    const template = this.getTemplate('invoice');

    const bankCounty =
      process.env.BANK_ADDRESS_STATE || process.env.BANK_ADDRESS_COUNTY
        ? [process.env.BANK_ADDRESS_STATE || process.env.BANK_ADDRESS_COUNTY]
        : [];

    const {
      address: { country },
    } = payload;

    const data = {
      formatPriceFn: FormatUtils.formatPrice,
      dateFormatFn: format,
      ...payload,
      addressCountry: getCountry(country),
      addressState: stateList.name[payload.address.state],
      companyNumber: process.env.COMPANY_REGISTRATION_NUMBER,
      vatNumber: process.env.COMPANY_VAT_NUMBER,
      assistanceEmail: process.env.ASSISTANCE_EMAIL,
      tenantAddress: process.env.TENANT_ADDRESS,
      logo: `data:image/${imgType};base64, ${logoData}`,
      bankDetails: {
        accountName: process.env.BANK_ACCOUNT_NAME,
        accountType: process.env.BANK_ACCOUNT_TYPE,
        accountNumber: process.env.BANK_ACCOUNT_NUMBER,
        sortCode: process.env.BANK_SORT_CODE,
        swift: process.env.BANK_SWIFT,
        iban: process.env.BANK_IBAN,
        accountCurrency: env.BANK_ACCOUNT_CURRENCY,
        bankAddress: [
          process.env.BANK_ADDRESS_LINE_1,
          process.env.BANK_ADDRESS_LINE_2,
          process.env.BANK_ADDRESS_LINE_3,
          process.env.BANK_ADDRESS_CITY,
          ...bankCounty,
          process.env.BANK_ADDRESS_POSTCODE,
          process.env.BANK_ADDRESS_COUNTRY,
        ].join(', '),
        beneficiaryAddress: [
          process.env.BANK_BENEFICIARY_ADDRESS_LINE_1,
          process.env.BANK_BENEFICIARY_ADDRESS_LINE_2,
          process.env.BANK_BENEFICIARY_ADDRESS_CITY,
          process.env.BANK_BENEFICIARY_ADDRESS_POSTCODE,
          process.env.BANK_BENEFICIARY_ADDRESS_STATE,
        ].join(', '),
      },
    };

    const htmlTemplate = template(data);

    try {
      return await generatePdf(page, htmlTemplate);
    } catch (error) {
      this.logger.error(error.message, error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  public addTemplate(name: string, fileName: string): PdfGeneratorService {
    this.templates[name] = { fileName };
    return this;
  }

  private getTemplate(name: string): ejs.TemplateFunction {
    if (!(name in this.templates)) {
      return () => '';
    }

    const template = this.templates[name];

    const file = path.join(__dirname, 'templates/', template.fileName);

    const templateStr = fs.readFileSync(file, 'utf8');
    if (!template.compile) {
      template.compile = ejs.compile(templateStr);
    }

    return template.compile;
  }
}
function getCountry(country: string) {
  return country === COUNTRY_CODES.UK
    ? countryList.getName(COUNTRY_CODES.GB)
    : countryList.getName(country);
}

async function createNewPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  return { page, browser };
}

async function convertLogoType(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const logoData = Buffer.from(response.data, 'binary').toString('base64');
  let imgType = convertTypeToBase64(url);
  return { imgType, logoData };
}

function convertTypeToBase64(url: any) {
  const logoTermination = url.substring(url.length - 3);
  let imgType = 'png';

  if (logoTermination === 'svg') {
    imgType = 'svg+xml';
  }

  if (logoTermination === 'ebp') {
    imgType = 'webp';
  }
  return Buffer.from(imgType).toString('base64');
}

async function generatePdf(
  page: puppeteer.Page,
  htmlTemplate: string
): Promise<Readable> {
  await page.setContent(htmlTemplate, {
    waitUntil: 'domcontentloaded',
    args: ['--disable-dev-shm-usage'],
  } as any);

  const buffer = await page.pdf({
    format: 'a4',
    margin: { top: '0.25cm', right: '1cm', bottom: '0.25cm', left: '1cm' },
    printBackground: true,
  });

  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
}
