export interface GetRecentLogsDTO {
  pagination?: {
    offset?: number;
    limit?: number;
  };
  filters?: {};
}
