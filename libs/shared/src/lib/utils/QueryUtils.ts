function wrap(value) {
  return value ? [value] : [];
}

export class Filters {
  static collect(src) {
    // return {
    //   invoiceStatus: [...src.invoiceStatus],
    //   transactionStatus: [...src.transactionStatus],
    //   journalId: src.journalId,
    //   referenceNumber: src.referenceNumber || null,
    //   customId: src.customId
    // };

    return {
      invoiceStatus: [...src.invoiceStatus],
      transactionStatus: [...src.transactionStatus],
      referenceNumber: wrap(src.referenceNumber),
      invoiceItem: {
        article: {
          journalId: src.journalId,
          customId: wrap(src.customId),
        }
      }
    };
  }
}
