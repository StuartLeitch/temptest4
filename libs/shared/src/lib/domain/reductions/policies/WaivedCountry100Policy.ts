import { PolicyContract } from '../contracts/Policy';

import { WaivedCountry100Rule } from './WaivedCountry100Rule';

/**
 * * Corresponding author’s institution is based in a 100% waived country
 *
 * * IF (waiverCountries[correspondingAuthor.country])
 * * THEN {APC = 0}
 */
export class WaivedCountry100Policy
  implements PolicyContract<WaivedCountry100Rule> {
  WAIVED_COUNTRY = Symbol.for('@WaivedCountry100Policy');

  /**
   * @Description
   *    Calculate the discount based on the corresponding author institution country code
   * @param invoice
   */
  public getDiscount(
    correspondingAuthorInstitutionCountryCode: string
  ): WaivedCountry100Rule {
    return new WaivedCountry100Rule(correspondingAuthorInstitutionCountryCode);
  }

  public getType(): symbol {
    return this.WAIVED_COUNTRY;
  }
}
