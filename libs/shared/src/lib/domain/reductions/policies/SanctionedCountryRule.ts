import { ReductionRuleContract } from '../contracts/ReductionRule';
import { Waiver, WaiverType } from '../../../modules/waivers/domain/Waiver';

const SANCTIONED_COUNTRIES = {
  AF: { country: 'Afghanistan' },
  CU: { country: 'Cuba' },
  IR: { country: 'Iran' },
  KP: { country: 'Democratic People’s Republic of Korea' },
  SS: { country: 'South Sudan' },
  SD: { country: 'Sudan' },
  SY: { country: 'Syria' },
  UA: { country: 'Ukraine' }
};

export class SanctionedCountryRule implements ReductionRuleContract<Waiver> {
  public constructor(
    public correspondingAuthorInstitutionCountryCode: string
  ) {}

  public getReduction(): Waiver {
    if (
      this.correspondingAuthorInstitutionCountryCode in SANCTIONED_COUNTRIES
    ) {
      return Waiver.create({
        reduction: -1,
        waiverType: WaiverType.SANCTIONED_COUNTRY
      }).getValue();
    }
  }
}
