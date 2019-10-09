import {TaxRuleContract} from '../contracts/TaxRuleContract';

export class UKVATTreatmentOfHardCopyPublicationsRule
  implements TaxRuleContract {
  public IsBusiness: boolean;
  public CountryCode: string;

  public constructor(countryCode: string, asBusiness = false) {
    this.IsBusiness = asBusiness;
    this.CountryCode = countryCode;
  }

  public getVAT(): number {
    return 0;
  }
}
