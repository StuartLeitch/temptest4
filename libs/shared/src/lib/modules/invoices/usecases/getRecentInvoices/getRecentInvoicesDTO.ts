export interface GetRecentInvoicesDTO {
  pagination?: {
    offset?: number;
    limit?: number;
  };
  filters?: {};
}
