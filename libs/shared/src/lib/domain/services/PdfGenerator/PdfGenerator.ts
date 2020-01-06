import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { format } from 'date-fns';
import ejs from 'ejs';
import pdf from 'html-pdf';
import countryList from 'country-list';
import stateList from 'state-list';
import base64Img from 'base64-img';

import { Address, Article, Invoice, Author, Payer } from '@hindawi/shared';
import { FormatUtils } from '../../../utils/FormatUtils';

export interface InvoicePayload {
  invoiceLink: string;
  address: Address;
  article: Article;
  invoice: Invoice;
  author: Author;
  payer: Payer;
}

export class PdfGeneratorService {
  private templates: {
    [key: string]: {
      fileName: string;
      compile?: ejs.TemplateFunction;
    };
  } = {};

  static async convertLogo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      base64Img.requestBase64(url, (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(body);
      });
    });
  }

  public async getInvoice(payload: InvoicePayload): Promise<Readable> {
    const logoUrl =
      'http://demo-gsw-invoicing-web.eu-west-1.elasticbeanstalk.com/assets/gsw/images/Lithosphere_logo_web.png';
    const logoData = await PdfGeneratorService.convertLogo(logoUrl);

    return new Promise((resolve, reject) => {
      const template = this.getTemplate('invoice');
      const data = {
        formatPriceFn: FormatUtils.formatPrice,
        dateFormatFn: format,
        ...payload,
        addressCountry: countryList.getName(payload.address.country),
        addressState: stateList.name[payload.address.state],
        companyNumber: process.env.COMPANY_REGISTRATION_NUMBER,
        vatNumber: process.env.COMPANY_VAT_NUMBER,
        assistanceEmail: process.env.ASSISTANCE_EMAIL,
        tenantName: process.env.TENANT_NAME,
        tenantAddress: process.env.TENANT_ADDRESS,
        logo: logoData,
        bankDetails: {
          accountName: process.env.BANK_ACCOUNT_NAME,
          accountType: process.env.BANK_ACCOUNT_TYPE,
          accountNumber: process.env.BANK_ACCOUNT_NUMBER,
          sortCode: process.env.BANK_SORT_CODE,
          swift: process.env.BANK_SWIFT,
          iban: process.env.BANK_IBAN,
          bankAddress: [
            process.env.BANK_ADDRESS_LINE_1,
            process.env.BANK_ADDRESS_LINE_2,
            process.env.BANK_ADDRESS_LINE_3,
            process.env.BANK_ADDRESS_CITY,
            process.env.BANK_ADDRESS_STATE || process.env.BANK_ADDRESS_COUNTY,
            process.env.BANK_ADDRESS_POSTCODE
          ].join(', '),
          beneficiaryAddress: [
            process.env.BANK_BENEFICIARY_ADDRESS_LINE_1,
            process.env.BANK_BENEFICIARY_ADDRESS_LINE_2,
            process.env.BANK_BENEFICIARY_ADDRESS_CITY,
            process.env.BANK_BENEFICIARY_ADDRESS_POSTCODE,
            process.env.BANK_BENEFICIARY_ADDRESS_STATE
          ].join(', ')
        }
      };
      const html = template(data);

      const pdfOptions: pdf.CreateOptions = {
        border: {
          left: '1cm',
          right: '1cm',
          bottom: '0.75cm',
          top: '0.25cm'
        },
        format: 'A4',
        footer: {
          height: '2cm'
        },
        header: {
          height: '2.5cm'
        },
        phantomPath: '/usr/local/bin/phantomjs',
        // phantomPath: 'node_modules/.bin/phantomjs',
        phantomArgs: []
      };
      try {
        pdf.create(html, pdfOptions).toStream((err, stream) => {
          if (err) {
            return reject(err);
          }

          resolve(stream);
        });
      } catch (e) {
        console.log(e);
        resolve(null);
      }
    });
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
