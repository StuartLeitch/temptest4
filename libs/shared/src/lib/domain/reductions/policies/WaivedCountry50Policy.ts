import { PolicyContract } from '../contracts/Policy';

import { WaivedCountry50Rule } from './WaivedCountry50Rule';

/**
 * * Corresponding author’s institution is based in a 50% waived country
 *
 * * IF (waiverCountries[correspondingAuthor.country])
 * * THEN {APC = 0}
 */
export class WaivedCountry50Policy
  implements PolicyContract<WaivedCountry50Rule> {
  WAIVED_COUNTRY = Symbol.for('@WaivedCountry50Policy');

  /**
   * @Description
   *    Calculate the discount based on the corresponding author institution country code
   * @param invoice
   */
  public getDiscount(
    correspondingAuthorInstitutionCountryCode: string
  ): WaivedCountry50Rule {
    return new WaivedCountry50Rule(correspondingAuthorInstitutionCountryCode);
  }

  public getType(): symbol {
    return this.WAIVED_COUNTRY;
  }
}
