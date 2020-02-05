import { TABLES } from '@hindawi/infrastructure';
import { reduce } from '@hindawi/utils';

export function filtered(src: any, filters: any) {
  return reduce(filters, {
    ['/invoices/invoiceItem/article/journalId/in'](here, filter) {
      return here
        .join(
          TABLES.INVOICE_ITEMS,
          `${TABLES.INVOICES}.id`,
          '=',
          `${TABLES.INVOICE_ITEMS}.invoiceId`
        )
        .join(
          TABLES.ARTICLES,
          `${TABLES.ARTICLES}.id`,
          '=',
          `${TABLES.INVOICE_ITEMS}.manuscriptId`
        )
        .whereIn(`${TABLES.ARTICLES}.journalId`, filter);
        // .join(
        //   TABLES.CATALOG,
        //   `${TABLES.CATALOG}.journalId`,
        //   '=',
        //   `${TABLES.ARTICLES}.journalId`
        // )
        // .whereIn(`${TABLES.CATALOG}.id`, filter);
    },

    ['/invoices/invoiceItem/article/customId/eq'](here, filter) {
      return here
        .join(
          TABLES.INVOICE_ITEMS,
          `${TABLES.INVOICES}.id`,
          '=',
          `${TABLES.INVOICE_ITEMS}.invoiceId`
        )
        .join(
          TABLES.ARTICLES,
          `${TABLES.ARTICLES}.id`,
          '=',
          `${TABLES.INVOICE_ITEMS}.manuscriptId`
        )
        .where(`${TABLES.ARTICLES}.customId`, filter);
    },

    ['/invoices/transaction/status/in'](here, filter) {
      return here
        .join(
          TABLES.TRANSACTIONS,
          `${TABLES.INVOICES}.transactionId`,
          '=',
          `${TABLES.TRANSACTIONS}.id`
        )
        .whereIn(`${TABLES.TRANSACTIONS}.status`, filter);
    },

    ['/invoices/status/in'](here, filter) {
      return here.whereIn(`${TABLES.INVOICES}.status`, filter);
    },

    ['/invoices/referenceNumber/eq'](here, filter) {
      const [m, invoiceNumber, creationYear] = /^0*(\d+)\/(\d+)$/.exec(filter);
      return here.whereRaw(
        `"${TABLES.INVOICES}"."invoiceNumber" = ${invoiceNumber} and extract(year from "${TABLES.INVOICES}"."dateAccepted") = ${creationYear}`
      );
    }
  }, src);
}
