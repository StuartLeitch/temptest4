export const JOURNAL_FRAGMENT = `
  fragment journalFragment on InvoicingJournal {
    journalId
    id
    code
    journalTitle
    amount
    issn
    publisherId
    publisher {
      name
      id
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

export const APC_PUBLISHER_LIST_QUERY = `
query getPublishers(
  $pagination: Pagination
) {
  getPublishers(
    pagination: $pagination
  ) {
    totalCount
    publishers {
      id
      name
    }
  }
}
`;

export const APC_PUBLISHER_BY_NAME_QUERY = `
  query getPublisherByName(
    $name: String
    ) {
      getPublisherByName(
        name: $name
      ) {
        id
        name
      }
    }
  )
`;

export const APC_PUBLISHER_QUERY = `
  query getPublisherDetails(
    $publisherId: ID
  ) {
    getPublisherDetails(
      publisherId: $publisherId
    ) {
      id
      name
    }
  }
`;
