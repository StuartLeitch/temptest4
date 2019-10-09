import {PolicyContract} from 'modules/invoices/domain/contracts/PolicyContract';
import {UKVATAnnualInstitutionalMembershipRule} from './UKVATAnnualInstitutionalMembershipRule';

/**
 * * 1. Determine if customer is institution
 * * 2. Determine if institution is from UK|EU|Non-EU
 * * 3. Determine if institution IS/IS NOT in business
 * * 4. Decision Tree:
 * *    If UK institution: 20%
 * *    If EU institution and In Business: Outside UK VAT
 * *    If EU institution and NOT In Business: 20%
 * *    If Non-EU institution: Outside UK VAT
 */
export class UKVATTreatmentOAnnualInstitutionalMembershipPolicy
  implements PolicyContract<UKVATAnnualInstitutionalMembershipRule> {
  UK_VAT_TREATMENT_ANNUAL_INSTITUTIONAL_MEMBERSHIP = Symbol.for(
    '@UKVATTreatmentOfAnnualInstitutionalMembershipPolicy'
  );

  /**
   * @Description
   *    Calculate the VAT based on the net value, country code
   *    and indication if the customer is a company or not.
   * @param invoice
   */
  public getVAT(
    countryCode: string,
    asBusiness: boolean = false,
    inBusiness: boolean = true
  ): UKVATAnnualInstitutionalMembershipRule {
    return new UKVATAnnualInstitutionalMembershipRule(
      countryCode,
      asBusiness,
      inBusiness
    );
  }

  public getType(): Symbol {
    return this.UK_VAT_TREATMENT_ANNUAL_INSTITUTIONAL_MEMBERSHIP;
  }
}
