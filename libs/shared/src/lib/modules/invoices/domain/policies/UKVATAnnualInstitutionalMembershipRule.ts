import {TaxRuleContract} from 'modules/invoices/domain/contracts/TaxRuleContract';

export class UKVATAnnualInstitutionalMembershipRule implements TaxRuleContract {
  public AsBusiness: boolean;
  public InBusiness: boolean;
  public CountryCode: string;

  public constructor(
    countryCode: string,
    asBusiness: boolean = false,
    inBusiness: boolean = true
  ) {
    this.AsBusiness = asBusiness;
    this.InBusiness = inBusiness;
    this.CountryCode = countryCode;
  }

  public getVAT(): number {
    return 0;
  }
}
