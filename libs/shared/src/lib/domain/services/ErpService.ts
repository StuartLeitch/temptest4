import { Invoice, Payer, InvoiceItem, Address, Article } from '@hindawi/shared';
import { Manuscript } from '../../modules/manuscripts/domain/Manuscript';
import { PublisherCustomValues } from '../../modules/publishers/domain/PublisherCustomValues';

export interface ErpInvoiceRequest {
  invoice: Invoice;
  originalInvoice?: Invoice;
  creditNote?: Invoice;
  items: InvoiceItem[];
  payer: Payer;
  manuscript: Manuscript;
  billingAddress: Address;
  journalName?: string;
  vatNote?: Record<string, unknown>;
  rate?: number;
  total?: number;
  invoiceTotal?: number;
  exchangeRate?: number;
  tradeDocumentItemProduct: string;
  customSegmentId?: string;
  taxRateId?: string;
  itemId?: string;
}

export interface ErpRevRecRequest {
  publisherCustomValues: PublisherCustomValues;
  manuscript: Manuscript;
  invoiceTotal: number;
  invoice: Invoice;
  payer: Payer;
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
  journalItem: any;
  journalTags: any;
  journalItemTag: any;
}

export interface ErpServiceContract {
  readonly vendorName: string;
  registerInvoice(data: ErpInvoiceRequest): Promise<ErpInvoiceResponse>;
  registerRevenueRecognition(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse>;
  registerCreditNote?(data: any): Promise<any>;
  registerPayment?(data: any): Promise<any>;
}

export class EmptyErpService implements ErpServiceContract {
  get vendorName(): string {
    return 'emptyVendor';
  }

  async registerInvoice(data: ErpInvoiceRequest): Promise<ErpInvoiceResponse> {
    return {
      tradeDocumentId: '',
      tradeItemIds: [''],
      accountId: '',
    };
  }

  async registerRevenueRecognition(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse> {
    return {
      journal: {
        id: '',
      },
      journalItem: null,
      journalTags: null,
      journalItemTag: null,
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
