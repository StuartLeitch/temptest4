import { PayPalPaymentSourceResponse as PaymentSourceResponse } from './payment-source';
import { PayPalLinkDescription as LinkDescription } from './link-description';
import { PayPalIntent as Intent } from './intent';
import { PayPalStatus as Status } from './status';
import { PayPalPayer as Payer } from './payer';
import {
  PayPalPurchaseUnit as PurchaseUnit,
  PayPalPurchaseUnitRequest,
} from './purchase-unit';

enum ShippingPreference {
  SET_PROVIDED_ADDRESS = 'SET_PROVIDED_ADDRESS',
  GET_FROM_FILE = 'GET_FROM_FILE',
  NO_SHIPPING = 'NO_SHIPPING',
}

export enum UserAction {
  CONTINUE = 'CONTINUE',
  PAY_NOW = 'PAY_NOW',
}

enum PayeePreferredPaymentSource {
  IMMEDIATE_PAYMENT_REQUIRED = 'IMMEDIATE_PAYMENT_REQUIRED',
  UNRESTRICTED = 'UNRESTRICTED',
}

interface PaymentMethod {
  payer_selected?: string;
  payee_preferred?: PayeePreferredPaymentSource;
}

interface OrderApplicationContext {
  brand_name?: string;
  locale?: string;
  landing_page?: string;
  shipping_preference?: ShippingPreference;
  user_action?: UserAction;
  payment_method?: PaymentMethod;
  return_url?: string;
  cancel_url?: string;
}

export interface PayPalOrderRequest {
  intent: Intent;
  payer?: Payer;
  purchase_units: Array<PayPalPurchaseUnitRequest>;
  application_context?: OrderApplicationContext;
}

export interface PayPalOrderResponse {
  create_time: string;
  update_time: string;
  id: string;
  payment_source: PaymentSourceResponse;
  intent: Intent;
  payer: Payer;
  purchase_units: Array<PurchaseUnit>;
  status: Status;
  links: Array<LinkDescription>;
}
