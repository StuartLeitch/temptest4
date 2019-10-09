import {PolicyContract} from '../contracts/PolicyContract';
import {UKVATTreatmentArticleProcessingChargesRule} from './UKVATTreatmentArticleProcessingChargesRule';

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
    countryCode: string,
    asBusiness: boolean = false,
    VATRegistered: boolean = true
  ): UKVATTreatmentArticleProcessingChargesRule {
    return new UKVATTreatmentArticleProcessingChargesRule(
      countryCode,
      asBusiness,
      VATRegistered
    );
  }

  public getType(): Symbol {
    return this.UK_VAT_TREATMENT_ARTICLE_PROCESSING_CHARGES;
  }
}
