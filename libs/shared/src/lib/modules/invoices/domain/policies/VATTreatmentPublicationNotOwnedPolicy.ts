import {PolicyContract} from '../contracts/PolicyContract';
import {UKVATTreatmentArticleProcessingChargesRule} from './UKVATTreatmentArticleProcessingChargesRule';

/**
 * * 1. Determine if customer is institution
 * * 2. Determine if institution is from UK|EU|Non-EU
 * * 3. Determine if institution IS/IS NOT in business
 */
export class VATTreatmentPublicationNotOwnedPolicy
  implements PolicyContract<UKVATTreatmentArticleProcessingChargesRule> {
  VAT_TREATMENT_PUBLICATION_NOT_OWNED = Symbol.for(
    '@VATTreatmentPublicationNotOwnedPolicy'
  );

  /**
   * @Description
   *    Calculate the VAT based on the net value, country code
   *    and indication if the customer is a company or not.
   * @param invoice
   */
  public getVAT(
    countryCode: string,
    asBusiness = false,
    VATRegistered = true
  ): UKVATTreatmentArticleProcessingChargesRule {
    return new UKVATTreatmentArticleProcessingChargesRule(
      countryCode,
      asBusiness,
      VATRegistered
    );
  }

  public getType(): symbol {
    return this.VAT_TREATMENT_PUBLICATION_NOT_OWNED;
  }
}
