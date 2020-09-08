import weasyprint from 'weasyprint-wrapper';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import ejs from 'ejs';
import countryList from 'country-list';
import stateList from 'state-list';
import base64Img from 'base64-img';

import { Address, Article, Invoice, Author, Payer } from '@hindawi/shared';
import { FormatUtils } from '../../../utils/FormatUtils';
import { LoggerContract } from '../../../infrastructure/logging/Logger';

export interface InvoicePayload {
  invoiceLink: string;
  address: Address;
  article: Article;
  invoice: Invoice;
  author: Author;
  payer: Payer;
}

// Specify the location of weasyprint cli if not in PATH
weasyprint.command = '/usr/local/bin/python3 -m weasyprint';

export class PdfGeneratorService {
  constructor(private logger: LoggerContract) {}
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
    const logoUrl = process.env.LOGO_URL;
    const logoData = await PdfGeneratorService.convertLogo(logoUrl);

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
          process.env.BANK_ADDRESS_POSTCODE,
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
      
      return weasyprint(htmlTemplate, {
        pageSize: 'A4',
      });
      // .pipe
      // new Readable({
      //   read() {
      //     this.push(buffer);
      //     this.push(null);
      //   },
      // })
      // ();
    } catch (error) {
      this.logger.error(error.message, error);
      throw error;
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
