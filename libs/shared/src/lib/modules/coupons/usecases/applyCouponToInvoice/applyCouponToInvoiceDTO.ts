export type ApplyCouponToInvoiceDTO = {
  invoiceId: string;
  couponCode: string;
  sanctionedCountryNotificationReceiver?: string;
  sanctionedCountryNotificationSender?: string;
};
