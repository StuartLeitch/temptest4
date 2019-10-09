import {TaxRuleContract} from '../contracts/TaxRuleContract';

export class UKVATAnnualInstitutionalMembershipRule implements TaxRuleContract {
  public AsBusiness: boolean;
  public InBusiness: boolean;
  public CountryCode: string;

  public constructor(
    countryCode: string,
    asBusiness = false,
    inBusiness = true
  ) {
    this.AsBusiness = asBusiness;
    this.InBusiness = inBusiness;
    this.CountryCode = countryCode;
  }

  public getVAT(): number {
    return 0;
  }
}
