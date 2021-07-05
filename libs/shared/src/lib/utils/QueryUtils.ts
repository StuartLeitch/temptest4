function wrap(value) {
  return value ? [value] : [];
}

export class Filters {
  static collect(src) {
    return {
      invoiceStatus: src.invoiceStatus && [...src.invoiceStatus],
      transactionStatus: src.transactionStatus && [...src.transactionStatus],
      referenceNumber: src.referenceNumber && wrap(src.referenceNumber),
      invoiceItem: {
        article: {
          journalId: src && src.journalId,
          customId: src.customId && wrap(src.customId),
        },
      },
    };
  }
}
