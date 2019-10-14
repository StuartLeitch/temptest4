import {ReductionRuleContract} from '../contracts/ReductionRule';
import {ReductionFactory} from '../ReductionFactory';
import {Reduction, ReductionProps} from '../Reduction';

const SANCTIONED_COUNTRIES = {
  AF: {country: 'Afghanistan'},
  CU: {country: 'Cuba'},
  IR: {country: 'Iran'},
  KP: {country: 'Democratic People’s Republic of Korea'},
  SS: {country: 'South Sudan'},
  SD: {country: 'Sudan'},
  SY: {country: 'Syria'},
  UA: {country: 'Ukraine'}
};

export class SanctionedCountryRule implements ReductionRuleContract<Reduction> {
  public constructor(
    public correspondingAuthorInstitutionCountryCode: string
  ) {}

  public getReduction(): Reduction {
    if (
      this.correspondingAuthorInstitutionCountryCode in SANCTIONED_COUNTRIES
    ) {
      return ReductionFactory.createReduction('WAIVER', {
        reduction: -1
      } as ReductionProps);
    }
  }
}
