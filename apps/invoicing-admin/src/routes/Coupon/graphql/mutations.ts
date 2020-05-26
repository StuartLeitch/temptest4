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

export const COUPON_CREATE_MUTATION = `
  mutation createCoupon(
    $coupon: CouponInput!
  ) {
    createCoupon(
      coupon: $coupon
    ) {
      name
      code
      reduction
      type
      name
      expirationDate
      status
    }
  }
`;
