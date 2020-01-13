import { PolicyContract } from '../contracts/PolicyContract';
import { UKVATTreatmentArticleProcessingChargesRule } from './UKVATTreatmentArticleProcessingChargesRule';
import { Address } from './Address';

export class UKVATTreatmentArticleProcessingChargesPolicy
  implements PolicyContract<UKVATTreatmentArticleProcessingChargesRule> {
  UK_VAT_TREATMENT_ARTICLE_PROCESSING_CHARGES = Symbol.for(
    '@UKVATTreatmentOfArticleProcessingChargesPolicy'
  );

  /**
   * @Description
   *    Calculate the VAT based on the net value, country code
   *    and indication if the customer is a company or not.
   * @param invoice
   */
  public getVAT(
    address: Address,
    asBusiness = false,
    VATRegistered = true
  ): UKVATTreatmentArticleProcessingChargesRule {
    return new UKVATTreatmentArticleProcessingChargesRule(
      address,
      asBusiness,
      VATRegistered
    );
  }

  public getType(): symbol {
    return this.UK_VAT_TREATMENT_ARTICLE_PROCESSING_CHARGES;
  }
}
