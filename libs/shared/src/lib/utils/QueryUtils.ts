function wrap(value) {
  return value ? [value] : [];
}

export class Filters {
  static collect(src) {
    return {
      invoiceStatus: src.invoiceStatus && [...src.invoiceStatus],
      transactionStatus: src.transactionStatus && [...src.transactionStatus],
      invoiceItem: {
        article: {
          // journalId: src.journalId,
          customId: wrap(src.customId),
        },
      },
    };
  }

  static collectCreditNotes(src) {
    return {
      reason: src.reason && [...src.reason],
    }
  }
}
