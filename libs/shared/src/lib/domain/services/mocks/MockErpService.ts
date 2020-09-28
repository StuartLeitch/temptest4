import { ErpServiceContract, ErpData, ErpInvoiceResponse } from '../ErpService';

export class MockErpService implements ErpServiceContract {
  private invoiceMap: { [key: string]: ErpData } = {};
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

  async registerInvoice(data: ErpData): Promise<ErpInvoiceResponse> {
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

  async registerRevenueRecognition(data: any): Promise<any> {
    const invoiceId = data.invoice.id.toValue().toString();
    this.revenueMap[invoiceId] = data;
    return {
      journal: { id: this.revenueRef },
    };
  }

  public getInvoice(invoiceId: string): ErpData {
    return this.invoiceMap[invoiceId];
  }

  public getRevenue(invoiceId: string): any {
    return this.revenueMap[invoiceId];
  }
}
