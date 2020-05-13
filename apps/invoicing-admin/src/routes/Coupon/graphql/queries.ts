export const COUPON_FRAGMENT = `
  fragment couponFragment on Coupon {
    id
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

export const COUPON_QUERY = `
  query getCouponDetails(
    $couponCode: String!
  ) {
    coupon(
      couponCode: $couponCode
    ) {
      ...couponFragment
    }
  }

  ${COUPON_FRAGMENT}
`;
