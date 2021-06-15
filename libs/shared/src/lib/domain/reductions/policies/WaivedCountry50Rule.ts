import { ReductionRuleContract } from '../contracts/ReductionRule';

import { Waiver, WaiverType } from '../../../modules/waivers/domain/Waiver';

const WAIVER_POLICY_COUNTRIES = {
  AL: { country: 'Albania' },
  DZ: { country: 'Algeria' },
  AG: { country: 'Antigua and Barbuda' },
  AM: { country: 'Armenia' },
  AZ: { country: 'Azerbaijan' },
  BY: { country: 'Belarus' },
  BO: { country: 'Bolivia (Plurinational State of)' },
  BA: { country: 'Bosnia and Herzegovina' },
  BW: { country: 'Botswana' },
  CO: { country: 'Colombia' },
  EC: { country: 'Ecuador' },
  EG: { country: 'Egypt' },
  SV: { country: 'El Salvador' },
  FJ: { country: 'Fiji' },
  GA: { country: 'Gabon' },
  GE: { country: 'Georgia' },
  GT: { country: 'Guatemala' },
  GY: { country: 'Guyana' },
  HN: { country: 'Honduras' },
  IQ: { country: 'Iraq' },
  JM: { country: 'Jamaica' },
  JO: { country: 'Jordan' },
  LB: { country: 'Lebanon' },
  LY: { country: 'Libya' },
  Mu: { country: 'Mauritius' },
  MN: { country: 'Mongolia' },
  ME: { country: 'Montenegro' },
  MA: { country: 'Morocco' },
  NA: { country: 'Namibia' },
  NG: { country: 'Nigeria' },
  MK: { country: 'North Macedonia' },
  PK: { country: 'Pakistan' },
  PW: { country: 'Palau' },
  PY: { country: 'Paraguay' },
  PE: { country: 'Peru' },
  KN: { country: 'Saint Kitts and Nevis' },
  RS: { country: 'Serbia' },
  SC: { country: 'Seychelles' },
  LK: { country: 'Sri Lanka' },
  TN: { country: 'Tunisia' },
  UA: { country: 'Ukraine' },
  UZ: { country: 'Uzbekistan' },
  VE: { country: 'Venezuela (Bolivarian Republic of)' },
  VN: { country: 'Viet Nam' },
  PS: { country: 'West Bank and Gaza Strip' },
};

export class WaivedCountry50Rule implements ReductionRuleContract<Waiver> {
  public constructor(
    public correspondingAuthorInstitutionCountryCode: string
  ) {}

  public getReduction(): Waiver {
    if (
      this.correspondingAuthorInstitutionCountryCode in WAIVER_POLICY_COUNTRIES
    ) {
      const waiver = Waiver.create({
        reduction: -0.5,
        waiverType: WaiverType.WAIVED_COUNTRY_50,
      });

      if (waiver.isLeft()) {
        throw waiver.value;
      }

      return waiver.value;
    }
  }
}
