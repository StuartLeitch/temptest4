import {ReductionRuleContract} from '../contracts/ReductionRule';
import {ReductionFactory} from '../ReductionFactory';
import {Reduction, ReductionProps} from '../Reduction';

const WAIVER_POLICY_COUNTRIES = {
  AF: {country: 'Afghanistan'},
  AO: {country: 'Angola'},
  BJ: {country: 'Benin'},
  BT: {country: 'Bhutan'},
  BO: {country: 'Bolivia'},
  BF: {country: 'Burkina Faso'},
  BI: {country: 'Burundi'},
  KH: {country: 'Cambodia'},
  CM: {country: 'Cameroon'},
  CV: {country: 'Cape Verde'},
  CF: {country: 'Central African Republic'},
  TD: {country: 'Chad'},
  KM: {country: 'Comoros'},
  CD: {country: 'Democratic Republic of Congo'},
  CG: {country: 'Congo'},
  CI: {country: 'Cote D’Ivoire'},
  KP: {country: 'Democratic People’s Republic of Korea'},
  DJ: {country: 'Djibouti'},
  TL: {country: 'East Timor'},
  SV: {country: 'El Salvador'},
  ER: {country: 'Eritrea'},
  ET: {country: 'Ethiopia'},
  GM: {country: 'Gambia'},
  GH: {country: 'Ghana'},
  GN: {country: 'Guinea'},
  GW: {country: 'Guinea-Bissau'},
  HT: {country: 'Haiti'},
  HN: {country: 'Honduras'},
  KE: {country: 'Kenya'},
  KI: {country: 'Kiribati'},
  KG: {country: 'Kyrgyzstan'},
  LA: {country: 'Laos'},
  LS: {country: 'Lesotho'},
  LR: {country: 'Liberia'},
  MG: {country: 'Madagascar'},
  MW: {country: 'Malawi'},
  ML: {country: 'Mali'},
  MR: {country: 'Mauritania'},
  MD: {country: 'Moldova'},
  MN: {country: 'Mongolia'},
  MA: {country: 'Morocco'},
  MZ: {country: 'Mozambique'},
  MM: {country: 'Myanmar'},
  NP: {country: 'Nepal'},
  NI: {country: 'Nicaragua'},
  NE: {country: 'Niger'},
  PS: {country: 'Palestinian Authority'},
  PG: {country: 'Papua New Guinea'},
  RW: {country: 'Rwanda'},
  ST: {country: 'Sao Tome and Principe'},
  SN: {country: 'Senegal'},
  SL: {country: 'Sierra Leone'},
  SB: {country: 'Solomon Islands'},
  SO: {country: 'Somalia'},
  SS: {country: 'South Sudan'},
  SD: {country: 'Sudan'},
  SZ: {country: 'Swaziland'}, //now Eswatini
  SY: {country: 'Syria'},
  TJ: {country: 'Tajikistan'},
  TZ: {country: 'Tanzania'},
  TG: {country: 'Togo'},
  TN: {country: 'Tunisia'},
  UG: {country: 'Uganda'},
  UA: {country: 'Ukraine'},
  UZ: {country: 'Uzbekistan'},
  VU: {country: 'Vanuatu'},
  VN: {country: 'Vietnam'},
  YE: {country: 'Yemen'},
  ZM: {country: 'Zambia'},
  ZW: {country: 'Zimbabwe'}
};

export class WaivedCountryRule implements ReductionRuleContract<Reduction> {
  public constructor(
    public correspondingAuthorInstitutionCountryCode: string
  ) {}

  public getReduction(): Reduction {
    if (
      this.correspondingAuthorInstitutionCountryCode in WAIVER_POLICY_COUNTRIES
    ) {
      return ReductionFactory.createReduction('WAIVER', {} as ReductionProps);
    }
  }
}
