import {PolicyContract} from '../contracts/Policy';
import {WaivedCountryRule} from './WaivedCountryRule';

/**
 * * Corresponding author’s institution is based in a sanctioned country
 * * which is also on the list of waiver countries
 *
 * * IF (waiverCountries[correspondingAuthor.country])
 * * THEN {APC = 0}
 */
export class WaivedCountryPolicy implements PolicyContract<WaivedCountryRule> {
  WAIVED_COUNTRY = Symbol.for('@WaivedCountryPolicy');

  /**
   * @Description
   *    Calculate the discount based on the corresponding author institution country code
   * @param invoice
   */
  public getDiscount(
    correspondingAuthorInstitutionCountryCode: string
  ): WaivedCountryRule {
    return new WaivedCountryRule(correspondingAuthorInstitutionCountryCode);
  }

  public getType(): symbol {
    return this.WAIVED_COUNTRY;
  }
}
