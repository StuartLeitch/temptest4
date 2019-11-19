export interface RecordPayPalPaymentDTO {
  id: string;
  create_time: string;
  resource: {
    amount: {
      value: string;
      currency_code: string;
    };
  };
}
