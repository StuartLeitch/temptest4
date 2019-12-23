import { PolicyContract } from '../contracts/PolicyContract';
import { USVATRule } from './USVATRule';

export class USVATPolicy implements PolicyContract<USVATRule> {
  US_VAT = Symbol.for('@USVATPolicy');

  public getVAT(
    countryCode: string,
    asBusiness = false,
    inBusiness = true
  ): USVATRule {
    return new USVATRule(countryCode, asBusiness, inBusiness);
  }

  public getType(): symbol {
    return this.US_VAT;
  }
}
