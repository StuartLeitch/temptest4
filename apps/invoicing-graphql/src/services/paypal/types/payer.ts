import { PayPalAddress as Address } from './address';

enum TaxIdType {
  BR_CPF = 'BR_CPF',
  BR_CNPJ = 'BR_CNPJ',
}

interface TaxInfo {
  tax_id: string;
  tax_id_type: TaxIdType;
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

export interface PayPalPayer {
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
