export const JOURNAL_FRAGMENT = `
  fragment journalFragment on InvoicingJournal {
    journalId
    journalTitle
    amount
    issn
    publisherId
  }
`;

export const APC_QUERY = `
query invoicingJournals(
  $pagination: Pagination
) {
  invoicingJournals(
    pagination: $pagination
  ) {
    totalCount
    catalogItems {
      ...journalFragment
    }
  }
}

  ${JOURNAL_FRAGMENT}
`;
