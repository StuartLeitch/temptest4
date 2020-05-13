import { COUPON_FRAGMENT } from './../../Coupon/graphql';

export const COUPONS_QUERY = `
  query fetchCoupons(
    $pagination: Pagination
  ) {
    coupons(
      pagination: $pagination
    ) {
      totalCount
      coupons {
        ...couponFragment
      }
    }
  }

  ${COUPON_FRAGMENT}
`;
