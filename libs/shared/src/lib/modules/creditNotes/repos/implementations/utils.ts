import { TABLES } from '../../../../infrastructure';
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
            TABLES.INVOICES,
            `${TABLES.CREDIT_NOTES}.invoiceId`,
            '=',
            `${TABLES.INVOICES}.id`
          )
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
        break;

      case '/invoiceItem/article/customId':
        here = here.whereIn(`${TABLES.ARTICLES}.customId`, filter);
        break;

      case '/transactionStatus':
        here = here.whereIn(`${TABLES.TRANSACTIONS}.status`, filter);
        break;

      case '/referenceNumber':
        const invoiceRef = filter[0];
        here = here.where({ persistentReferenceNumber: invoiceRef });
        break;

      case '/reason':
        const lookup = {
          'WITHDRAWN_MANUSCRIPT': 'withdrawn-manuscript',
          'REDUCTION_APPLIED': 'reduction-applied',
          'WAIVED_MANUSCRIPT': 'waived-manuscript',
          'CHANGED_PAYER_DETAILS': 'changed-payer-details',
          'BAD_DEBT': 'bad-debt',
          'OTHER_REASON': 'other-reason'
        }
        const filtr = filter.map((filter) => lookup[filter]);
        here = here.whereIn(`${TABLES.CREDIT_NOTES}.creationReason`, filtr);
        break;
    }
  }

  return here;
}
