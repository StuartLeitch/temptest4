export const COUPON_UPDATE_MUTATION = `
  mutation updateCoupon(
    $coupon: CouponInput!
  ) {
    updateCoupon(
      coupon: $coupon
    ) {
      reduction
      type
      name
      expirationDate
      status
    }
  }
`;
