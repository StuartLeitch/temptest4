export const LOG_FRAGMENT = `
  fragment logFragment on Log {
    id
  }
`;

export const AUDIT_LOGS_QUERY = `
  query auditLogs(
    $pagination: Pagination
  ) {
    auditlogs(
      pagination: $pagination
    ) {
      totalCount
      logs {
        ...logFragment
      }
    }
  }

  ${LOG_FRAGMENT}
`;
