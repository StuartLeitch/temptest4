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

  fragment couponFragment on Coupon {
    reduction
    type
    code
    dateCreated
    dateUpdated
    expirationDate
    redeemCount
    status
    name
  }
`;
