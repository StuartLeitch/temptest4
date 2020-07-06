import { PayPalIntent as Intent } from './intent';
import { PayPalStatus as Status } from './status';
import { PayPalPurchaseUnit as PurchaseUnit } from './purchase-unit';
import { PayPalLinkDescription as LinkDescription } from './link-description';
import { PayPalAddress as Address } from './address';

export interface PayPalOrder {
  intent: Intent;
  purchase_units: [];
}

enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  DISCOVER = 'DISCOVER',
  AMEX = 'AMEX',
  SOLO = 'SOLO',
  JCB = 'JCB',
  STAR = 'STAR',
  DELTA = 'DELTA',
  SWITCH = 'SWITCH',
  MAESTRO = 'MAESTRO',
  CB_NATIONALE = 'CB_NATIONALE',
  CONFIGOGA = 'CONFIGOGA',
  CONFIDIS = 'CONFIDIS',
  ELECTRON = 'ELECTRON',
  CETELEM = 'CETELEM',
  CHINA_UNION_PAY = 'CHINA_UNION_PAY',
}

enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PREPAID = 'PREPAID',
  UNKNOWN = 'UNKNOWN',
}

interface CardResponse {
  last_digits: string;
  brand: CardBrand;
  type: CardType;
}

interface WalletsResponse {
  apple_pay: {
    card: unknown;
  };
}

interface PaymentSourceResponse {
  card: CardResponse;
  wallet: WalletsResponse;
}

enum PhoneType {
  FAX = 'FAX',
  HOME = 'HOME',
  MOBILE = 'MOBILE',
  OTHER = 'OTHER',
  PAGER = 'PAGER',
}

interface PhoneWithType {
  phone_type?: PhoneType;
  phone_number: {
    national_number: string;
  };
}

enum TaxIdType {
  BR_CPF = 'BR_CPF',
  BR_CNPJ = 'BR_CNPJ',
}

interface TaxInfo {
  tax_id: string;
  tax_id_type: TaxIdType;
}

interface Payer {
  name: {
    given_name: string;
    surname: string;
  };
  email_address: string;
  payer_id: string;
  phone: PhoneWithType;
  birth_date: string;
  tax_info: TaxInfo;
  address: Address;
}

export interface PayPalCreateOrderResponse {
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
