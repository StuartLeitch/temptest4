import { TABLES } from '@hindawi/infrastructure';
import { LeanTraversal, ParseUtils, toPath, Categories, Cached } from '@utils';
import { QueryBuilder } from 'knex';

type Scalar = boolean | string | number;
type Filter = Scalar[];

interface Filters {
  // TODO: Add missing declarations here
}

function applyJoins(src: QueryBuilder, filterEntries) {
  let here: QueryBuilder = src;
  const categorizedPaths = new Categories([
    ['/invoiceItem/article/journalId', '/invoiceItem/article/customId'],
    ['/transactionStatus'],
  ]);

  for (const [keyList] of filterEntries) {
    const path = toPath(keyList);
    if (!categorizedPaths.has(path)) continue;

    categorizedPaths.dropCategoryOf(path);

    switch (path) {
      case '/invoiceItem/article/journalId':
      case '/invoiceItem/article/customId':
        here = here
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
          );
        // .join(
        //   TABLES.CATALOG,
        //   `${TABLES.CATALOG}.journalId`,
        //   '=',
        //   `${TABLES.ARTICLES}.journalId`
        // )
        break;

      case '/transactionStatus':
        here = here.join(
          TABLES.TRANSACTIONS,
          `${TABLES.INVOICES}.transactionId`,
          '=',
          `${TABLES.TRANSACTIONS}.id`
        );
        break;
    }
  }

  return here;
}

export function applyFilters(src: QueryBuilder, filters: Filters) {
  const cachedEntries = new Cached(LeanTraversal.deepTraverse(filters));
  let here: QueryBuilder = applyJoins(src, cachedEntries);

  let invoiceNumber: string, creationYear: string;
  for (const [keyList, filter] of cachedEntries) {
    switch (toPath(keyList)) {
      case '/invoiceItem/article/journalId':
        here = here.whereIn(`${TABLES.ARTICLES}.journalId`, filter);
        //         .whereIn(`${TABLES.CATALOG}.id`, filter);
        break;

      case '/invoiceItem/article/customId':
        if (filter[0] !== '') {
          here = here.whereIn(`${TABLES.ARTICLES}.customId`, filter);
        }
        break;

      case '/transactionStatus':
        here = here.whereIn(`${TABLES.TRANSACTIONS}.status`, filter);
        break;

      case '/invoiceStatus':
        here = here.whereIn(`${TABLES.INVOICES}.status`, filter);
        break;

      case '/referenceNumber':
        // [invoiceNumber, creationYear] = ParseUtils.parseRefNumber(filter[0]);
        const invoiceRef = filter[0];
        here = here.where({ persistentReferenceNumber: invoiceRef });
        break;
    }
  }
  return here;
}
