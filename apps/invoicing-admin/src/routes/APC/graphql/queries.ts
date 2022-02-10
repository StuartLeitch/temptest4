export const JOURNAL_FRAGMENT = `
  fragment journalFragment on InvoicingJournal {
    code
    journalTitle
    amount
    issn
    publisherId
    publisher {
      name
    }
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

export const APC_PUBLISHER_QUERY = `
  query getPublisherDetails(
    $publisherId: ID
  ) {
    getPublisherDetails(
      publisherId: $publisherId
    ) {
      name
    }
  }
`;
