export const LOG_FRAGMENT = `
  fragment logFragment on Log {
    id
    userAccount
    entity
    action
    timestamp
    oldValue
    currentValue
  }
`;

export const AUDIT_LOG_QUERY = `
  query log($id: ID) {
    auditlog(logId: $id) {
      ...logFragment
    }
  }

  ${LOG_FRAGMENT}
`;
