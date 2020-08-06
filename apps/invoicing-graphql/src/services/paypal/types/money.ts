import { ExchangeRate } from './exchange-rate';

export interface Money {
  currency_code: string;
  value: string;
}

export interface AmountBreakdown {
  shipping_discount?: Money;
  item_total?: Money;
  tax_total?: Money;
  insurance?: Money;
  shipping?: Money;
  handling?: Money;
  discount?: Money;
}

export interface AmountWithBreakdown extends Money {
  breakdown?: AmountBreakdown;
}

interface PayeeBase {
  email_address: string;
  merchant_id: string;
}

export interface PlatformFee {
  amount: Money;
  payee?: PayeeBase;
}

export interface SellerReceivableBreakdown {
  gross_amount: Money;
  paypal_fee?: Money;
  net_amount?: Money;
  receivable_amount?: Money;
  exchange_rate?: ExchangeRate;
  platform_fees?: Array<PlatformFee>;
}
