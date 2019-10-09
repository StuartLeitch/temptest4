import {PolicyContract} from '../contracts/Policy';
import {SanctionedCountryRule} from './SanctionedCountryRule';

/**
 * * Corresponding author’s institution is based in a sanctioned country
 * * which is also on the list of waiver countries
 *
 * * IF (waiverCountries[correspondingAuthor.country])
 * * THEN {APC = 0}
 */
export class WaivedCountryPolicy
  implements PolicyContract<SanctionedCountryRule> {
  SANCTIONED_COUNTRY = Symbol.for('@SanctionedCountryPolicy');

  /**
   * @Description
   *    Calculate the discount based on the corresponding author institution country code
   * @param invoice
   */
  public getDiscount(
    correspondingAuthorInstitutionCountryCode: string
  ): SanctionedCountryRule {
    return new SanctionedCountryRule(correspondingAuthorInstitutionCountryCode);
  }

  public getType(): Symbol {
    return this.SANCTIONED_COUNTRY;
  }
}
