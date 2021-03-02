import {
  ErpServiceContract,
  ErpInvoiceRequest,
  ErpInvoiceResponse,
  ErpRevRecRequest,
  ErpRevRecResponse,
} from '../ErpService';

export class MockErpService implements ErpServiceContract {
  private invoiceMap: { [key: string]: ErpInvoiceRequest } = {};
  private revenueMap: { [key: string]: any } = {};

  public readonly erpRef: string = 'ERP_REF';
  public readonly accountRef: string = 'ACC_REF';
  public readonly revenueRef: string = 'REV_REF';

  get vendorName(): string {
    return 'vendorName';
  }

  async registerInvoice(data: ErpInvoiceRequest): Promise<ErpInvoiceResponse> {
    const invoiceId = data.invoice.id.toValue().toString();
    this.invoiceMap[invoiceId] = data;
    return {
      accountId: this.accountRef,
      tradeDocumentId: this.erpRef,
      tradeItemIds: data.invoice.invoiceItems.map((ii) =>
        ii.invoiceItemId.id.toValue().toString()
      ),
    };
  }

  async registerRevenueRecognition(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse> {
    const invoiceId = data.invoice.id.toString();
    this.revenueMap[invoiceId] = data;

    return {
      journal: { id: this.revenueRef },
      journalItem: null,
      journalItemTag: null,
      journalTags: null,
    };
  }

  async registerRevenueRecognitionReversal(
    data: ErpRevRecRequest
  ): Promise<ErpRevRecResponse> {
    const invoiceId = data.invoice.id.toString();
    this.revenueMap[invoiceId] = data;

    return {
      journal: { id: this.revenueRef },
      journalItem: null,
      journalItemTag: null,
      journalTags: null,
    };
  }

  public getInvoice(invoiceId: string): ErpInvoiceRequest {
    return this.invoiceMap[invoiceId];
  }

  public getRevenue(invoiceId: string): any {
    return this.revenueMap[invoiceId];
  }

  public async checkInvoiceExists(invoiceId: string): Promise<boolean> {
    return true;
  }

  public async checkRevenueRecognitionExists(
    invoiceRefNumber: string,
    manuscriptCustomId: string
  ): Promise<boolean> {
    return true;
  }

  public async getRevenueRecognitionId(
    invoiceRefNumber: string,
    manuscriptCustomId: string
  ): Promise<string> {
    return '';
  }
}
