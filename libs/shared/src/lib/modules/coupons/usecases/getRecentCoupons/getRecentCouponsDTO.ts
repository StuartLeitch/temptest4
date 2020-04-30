export interface GetRecentCouponsDTO {
  pagination?: {
    page: number;
    offset?: number;
    limit?: number;
  };
  // filters?: {};
}
