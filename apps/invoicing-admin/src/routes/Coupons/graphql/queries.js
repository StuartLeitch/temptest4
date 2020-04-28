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
    id
    reduction
    type
    code
    dateCreated
    dateUpdated
    expirationDate
    invoiceItemType
    redeemCount
    status
    name
  }
`;
