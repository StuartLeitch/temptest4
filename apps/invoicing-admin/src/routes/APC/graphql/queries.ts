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
  getPublishers(
    pagination: $pagination
  ) {
    totalCount
    publishers {
      name
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
