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

  get invoiceErpRefFieldName(): string {
    return 'erpReference';
  }

  get invoiceRevenueRecRefFieldName(): string {
    return 'revenueRecognitionReference';
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
    const invoiceId = data.invoice.id.toValue().toString();
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
}
