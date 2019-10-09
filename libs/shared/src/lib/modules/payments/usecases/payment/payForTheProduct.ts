export class PayForTheProduct {
  public async execute({
    payer,
    invoice,
    displaysDraftInvoice,
    displaysAppliedDiscounts,
    displaysManuscriptDetails,
    hasPayerUpdatedTransactionDetails,
    hasPayerUsedCoupons,
    orderReprintWithAPC,
    hasPayerAddedORCID,
    hasPayerConfirmedInvoiceType,
    hasPayerConfirmedPayerDetails,
    applyFinancialPolicies,
    hasPayerConfirmedInvoice,
    payerDownloadsInvoice,
    emailInvoiceToPayer,
    signalERPOnInvoice,
    hasPayerSelectedPaymentMethod,
    displaysCurrentPaymentStatus
  }: any) {
    // * System displays draft Invoice information
    // * System displays applied Discounts
    // * System displays Manuscript details
    await Promise.all([
      displaysDraftInvoice(),
      displaysAppliedDiscounts(),
      displaysManuscriptDetails()
    ]);

    // * Payer updates some Transaction details
    await hasPayerUpdatedTransactionDetails();
    // * Payer uses Coupons (Editorial or Commercial)
    await hasPayerUsedCoupons();
    // ? System executes "Order reprints with APC"
    await orderReprintWithAPC();
    // * Payer adds ORCID number
    await hasPayerAddedORCID();
    // * Payer selects “individual” or “institutional”
    await hasPayerConfirmedInvoiceType();
    // * Payer confirms its details
    await hasPayerConfirmedPayerDetails();
    // * System applies Financial policies (VAT)
    await applyFinancialPolicies();
    // * Payer confirms invoice value
    await hasPayerConfirmedInvoice();
    // ? Payer downloads the Invoice
    await payerDownloadsInvoice();
    // * System sends the Invoice by e-mail to Payer
    await emailInvoiceToPayer(invoice, payer);
    // * System pushes Invoice to ERP Accounting
    await signalERPOnInvoice(invoice);
    // * Payer selects Payment Method
    await hasPayerSelectedPaymentMethod();
    // * Payer follows the specific process for each Payment Method
    // * System displays current status of Payment
    await displaysCurrentPaymentStatus();
  }
}
