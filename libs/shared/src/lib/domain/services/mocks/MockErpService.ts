import { ErpServiceContract, ErpData, ErpResponse } from '../ErpService';

export class MockErpService implements ErpServiceContract {
  private invoiceMap: { [key: string]: ErpData } = {};
  private revenueMap: { [key: string]: any } = {};

  public readonly erpRef: string = 'ERP_REF';
  public readonly accountRef: string = 'ACC_REF';

  async registerInvoice(data: ErpData): Promise<ErpResponse> {
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
  registerRevenueRecognition(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  getInvoice(invoiceId: string) {
    return this.invoiceMap[invoiceId];
  }
}
