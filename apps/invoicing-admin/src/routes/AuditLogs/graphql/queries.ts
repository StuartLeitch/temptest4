export const LOG_FRAGMENT = `
  fragment logFragment on Log {
    id
    userAccount
    entity
    action
    timestamp
    item_reference
    target
  }
`;

export const AUDIT_LOGS_QUERY = `
  query auditLogs(
    $pagination: Pagination
    $filters: LogsFilters
  ) {
    auditlogs(
      pagination: $pagination
      filters: $filters
    ) {
      totalCount
      logs {
        ...logFragment
      }
    }
  }

  ${LOG_FRAGMENT}
`;
