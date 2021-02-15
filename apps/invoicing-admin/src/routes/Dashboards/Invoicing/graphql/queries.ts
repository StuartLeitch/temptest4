// import { COUPON_FRAGMENT } from './../../Coupon/graphql';

export const STATISTICS_QUERY = `
  query countInvoices(
    status: 'DRAFT'
  ) {
    count
  }
`;
