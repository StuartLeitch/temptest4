import {
  ErpInvoiceResponse,
  ErpServiceContract,
  ErpInvoiceRequest,
  ErpRevRecResponse,
  ErpRevRecRequest,
  ErpTaxDetails,
} from '../ErpService';

export class MockErpService implements ErpServiceContract {
  private invoiceMap: {
    [key: string]: { invoice: ErpInvoiceRequest; taxDetails: ErpTaxDetails };
  } = {};
  private revenueMap: { [key: string]: any } = {};

  private taxDetailsUkStandard = {
    taxDetailsReference: 'NEW1',
    taxType: '2',
    taxCode: '53',
  };
  private taxDetailsUkZero = {
    taxDetailsReference: 'NEW1',
    taxType: '1',
    taxCode: '55',
  };

  public readonly erpRef: string = 'ERP_REF';
  public readonly accountRef: string = 'ACC_REF';
  public readonly revenueRef: string = 'REV_REF';

  get vendorName(): string {
    return 'vendorName';
  }

  async registerInvoice(data: ErpInvoiceRequest): Promise<ErpInvoiceResponse> {
    const invoiceId = data.invoice.id.toValue().toString();

    let taxDetails: ErpTaxDetails = null;

    if (
      data.billingAddress.country === 'GB' ||
      data.billingAddress.country === 'UK'
    ) {
      taxDetails = this.taxDetailsUkStandard;
    } else {
      taxDetails = this.taxDetailsUkZero;
    }

    this.invoiceMap[invoiceId] = { invoice: data, taxDetails };
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

  public getInvoice(
    invoiceId: string
  ): { invoice: ErpInvoiceRequest; taxDetails: ErpTaxDetails } {
    return this.invoiceMap[invoiceId];
  }

  public getRevenue(invoiceId: string): any {
    return this.revenueMap[invoiceId];
  }

  public async checkInvoiceExists(erpReference: string): Promise<boolean> {
    return true;
  }

  public async checkCustomerPaymentExists(refName: string): Promise<any> {
    return true;
  }

  public async getExistingRevenueRecognition(
    invoiceRefNumber: string,
    manuscriptCustomId: string
  ): Promise<any> {
    return { count: null, id: '' };
  }
}
