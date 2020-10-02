import { Invoice, Payer, InvoiceItem, Address, Article } from '@hindawi/shared';

export interface ErpData {
  invoice: Invoice;
  items: InvoiceItem[];
  payer: Payer;
  article: Article;
  billingAddress: Address;
  journalName?: string;
  vatNote?: Record<string, unknown>;
  rate?: number;
  tradeDocumentItemProduct: string;
  customSegmentId?: string;
  taxRateId?: string;
}

export interface ErpInvoiceResponse {
  accountId: string;
  tradeDocumentId: string;
  tradeItemIds: string[];
}

export interface ErpRevRecResponse {
  journal: {
    id: string;
  };
}

export interface ErpServiceContract {
  readonly invoiceErpRefFieldName: string;
  readonly invoiceRevenueRecRefFieldName: string;
  registerInvoice(data: ErpData): Promise<ErpInvoiceResponse>;
  registerRevenueRecognition(data: any): Promise<ErpRevRecResponse>;
  registerCreditNote?(data: any): Promise<any>;
  registerPayment?(data: any): Promise<any>;
}

export class EmptyErpService implements ErpServiceContract {
  get invoiceErpRefFieldName(): string {
    return 'emptyErpInvoiceRef';
  }

  get invoiceRevenueRecRefFieldName(): string {
    return 'emptyErpRecRef';
  }

  async registerInvoice(data: ErpData): Promise<ErpInvoiceResponse> {
    return {
      tradeDocumentId: '',
      tradeItemIds: [''],
      accountId: '',
    };
  }

  async registerRevenueRecognition(data: any): Promise<ErpRevRecResponse> {
    return {
      journal: {
        id: '',
      },
    };
  }

  async registerCreditNote?(data: any): Promise<any> {
    return '';
  }

  async registerPayment?(data: any): Promise<any> {
    return {
      tradeDocumentId: '',
      tradeItemIds: [''],
      accountId: '',
    };
  }
}
