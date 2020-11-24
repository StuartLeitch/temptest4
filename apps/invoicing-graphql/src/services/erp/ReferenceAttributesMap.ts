/**
 * Confirmation in Invoicing -> invoice in NetSuite
 * Payment  in Invoicing -> payment in NetSuite
 * Revenue Recognition in Invoicing -> Journal in NetSuite
 * Revenue Recognition Reversal in Invoicing -> Journal in NetSuite (with reversed credit / debit accounts)
 * Credit Note  in Invoicing -> Credit Memo in NetSuite
 */

export const ErpReferenceAttributesMapping = {
  sage: {
    invoiceConfirmation: 'confirmation',
    revenueRecognition: 'revenueRecognition',
  },
  netsuite: {
    invoiceConfirmation: 'confirmation',
    paymentConfirmation: 'payment',
    revenueRecognition: 'journal',
    revenueRecognitionReversal: 'journal',
    creditNote: 'creditMemo',
  },
};
