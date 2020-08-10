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

export interface PayPalPaymentSourceResponse {
  card: CardResponse;
  wallet: WalletsResponse;
}
