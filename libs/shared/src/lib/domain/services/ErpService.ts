import {
  PaymentMethod,
  InvoiceItem,
  Invoice,
  Address,
  Payment,
  Payer,
} from '@hindawi/shared';
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

export interface RegisterPaymentRequest {
  manuscript: Manuscript;
  payer: Payer;
  invoice: Invoice;
  payment: Payment;
  paymentMethods: PaymentMethod[];
  total: number;
  customerId?: string;
  invoicePayments?: any[];
}

export interface RegisterPaymentResponse {
  paymentReference: string;
}

export interface ErpServiceContract {
  readonly vendorName: string;
  readonly referenceMappings?: Record<string, any>;
  registerInvoice(data: ErpInvoiceRequest): Promise<ErpInvoiceResponse>;
  registerRevenueRecognition(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse>;
  registerRevenueRecognitionReversal?(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse>;
  registerCreditNote?(data: any): Promise<any>;
  registerPayment?(
    data: RegisterPaymentRequest
  ): Promise<RegisterPaymentResponse>;
  checkInvoiceExists(invoiceErpReference: string): Promise<boolean>;
  getExistingRevenueRecognition(
    invoiceRefNumber: string,
    manuscriptCustomId: string
  ): Promise<any>;
}

export class EmptyErpService implements ErpServiceContract {
  get vendorName(): string {
    return 'emptyVendor';
  }

  get referenceMappings(): Record<string, any> {
    return {};
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

  async registerRevenueRecognitionReversal?(
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

  async checkInvoiceExists(erpReference: string): Promise<any> {
    return true;
  }

  async checkCustomerPaymentExists(erpReference: string): Promise<any> {
    return true;
  }

  async getExistingRevenueRecognition(
    invoiceRefNumber: string,
    manuscriptCustomId: string
  ): Promise<{ count: number; id?: string }> {
    return { count: null, id: '' };
  }
}
