import { ReductionRuleContract } from '../contracts/ReductionRule';

import { Waiver, WaiverType } from '../../../modules/waivers/domain/Waiver';

const WAIVER_POLICY_COUNTRIES = {
  AF: { country: 'Afghanistan' },
  AO: { country: 'Angola' },
  BD: { country: 'Bangladesh' },
  BZ: { country: 'Belize' },
  BJ: { country: 'Benin' },
  BT: { country: 'Bhutan' },
  BF: { country: 'Burkina Faso' },
  BI: { country: 'Burundi' },
  KH: { country: 'Cambodia' },
  CM: { country: 'Cameroon' },
  CV: { country: 'Cape Verde' },
  CF: { country: 'Central African Republic' },
  TD: { country: 'Chad' },
  KM: { country: 'Comoros' },
  CG: { country: 'Congo' },
  CK: { country: 'Cook Islands' },
  CI: { country: 'Cote D’Ivoire' },
  CU: { country: 'Cuba' },
  KP: { country: 'Democratic People’s Republic of Korea' },
  CD: { country: 'Democratic Republic of Congo' },
  DJ: { country: 'Djibouti' },
  DM: { country: 'Dominica' },
  GQ: { country: 'Equatorial Guinea' },
  ER: { country: 'Eritrea' },
  SZ: { country: 'Eswatini' },
  ET: { country: 'Ethiopia' },
  GM: { country: 'Gambia' },
  GH: { country: 'Ghana' },
  GD: { country: 'Grenada' },
  GN: { country: 'Guinea' },
  GW: { country: 'Guinea-Bissau' },
  HT: { country: 'Haiti' },
  IR: { country: 'Iran' },
  KE: { country: 'Kenya' },
  KI: { country: 'Kiribati' },
  KG: { country: 'Kyrgyzstan' },
  LA: { country: "Lao People's Democratic Republic (the)" },
  LS: { country: 'Lesotho' },
  LR: { country: 'Liberia' },
  MG: { country: 'Madagascar' },
  MW: { country: 'Malawi' },
  MV: { country: 'Maldives' },
  ML: { country: 'Mali' },
  MH: { country: 'Marshall Islands' },
  MR: { country: 'Mauritania' },
  FM: { country: 'Micronesia (Federated States of)' },
  MZ: { country: 'Mozambique' },
  MM: { country: 'Myanmar' },
  NR: { country: 'Nauru' },
  NP: { country: 'Nepal' },
  NI: { country: 'Nicaragua' },
  NE: { country: 'Niger' },
  NU: { country: 'Niue' },
  PG: { country: 'Papua New Guinea' },
  MD: { country: 'Republic of Moldova' },
  RW: { country: 'Rwanda' },
  SH: { country: 'Saint Helena' },
  LC: { country: 'Saint Lucia' },
  VC: { country: 'Saint Vincent and the Grenadines' },
  WS: { country: 'Samoa' },
  ST: { country: 'Sao Tome and Principe' },
  SN: { country: 'Senegal' },
  SL: { country: 'Sierra Leone' },
  SB: { country: 'Solomon Islands' },
  SO: { country: 'Somalia' },
  SS: { country: 'South Sudan' },
  SD: { country: 'Sudan' },
  SR: { country: 'Suriname' },
  SY: { country: 'Syrian Arab Republic' },
  TJ: { country: 'Tajikistan' },
  TL: { country: 'Timor-Leste' },
  TG: { country: 'Togo' },
  TK: { country: 'Tokelau' },
  TO: { country: 'Tonga' },
  TV: { country: 'Tuvalu' },
  UG: { country: 'Uganda' },
  TZ: { country: 'United Republic of Tanzania' },
  VU: { country: 'Vanuatu' },
  YE: { country: 'Yemen' },
  ZM: { country: 'Zambia' },
  ZW: { country: 'Zimbabwe' },
};

export class WaivedCountry100Rule implements ReductionRuleContract<Waiver> {
  public constructor(
    public correspondingAuthorInstitutionCountryCode: string
  ) {}

  public getReduction(): Waiver {
    if (
      this.correspondingAuthorInstitutionCountryCode in WAIVER_POLICY_COUNTRIES
    ) {
      const waiver = Waiver.create({
        reduction: -1,
        waiverType: WaiverType.WAIVED_COUNTRY,
      });

      if (waiver.isLeft()) {
        throw waiver.value;
      }

      return waiver.value;
    }
  }
}
