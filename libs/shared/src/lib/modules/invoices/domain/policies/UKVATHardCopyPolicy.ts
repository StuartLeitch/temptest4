import {PolicyContract} from '../contracts/PolicyContract';
import {UKVATTreatmentOfHardCopyPublicationsRule} from './UKVATHardCopyRule';

/**
 * * All sales of hard copy journals will be made from the UK (Place Of Supply is UK)
 * * All such supplies of publications by Hindawi will be subject to the 0% VAT rate
 * * In the case of supplies of hard copy journals to VAT registered customers in other EU member states,
 * * Hindawi should obtain the EU customers VAT registration number
 * * Hindawi should be aware of the distance selling rules for non-business customers
 * * What is the distance selling threshold?
 *
 * * Determine is customer is from UK|NON-UE
 * * Determine if customer is VAT|Non-VAT registered
 */
export class UKVATTreatmentOfHardCopyPublicationsPolicy
  implements PolicyContract<UKVATTreatmentOfHardCopyPublicationsRule> {
  UK_VAT_TREATMENT_HARD_COPY_PUBLICATIONS = Symbol.for(
    '@UKVATreatmentOfHardCopyPublicationsPolicy'
  );

  /**
   * @Description
   *    Calculate the VAT based on the net value, country code
   *    and indication if the customer is a company or not.
   * @param invoice
   */
  public getVAT(
    countryCode: string,
    asBusiness = false
  ): UKVATTreatmentOfHardCopyPublicationsRule {
    return new UKVATTreatmentOfHardCopyPublicationsRule(
      countryCode,
      asBusiness
    );
  }

  public getType(): symbol {
    return this.UK_VAT_TREATMENT_HARD_COPY_PUBLICATIONS;
  }
}
