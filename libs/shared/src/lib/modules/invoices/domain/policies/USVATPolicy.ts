import { PolicyContract } from '../contracts/PolicyContract';
import { USVATRule } from './USVATRule';
import { Address } from './Address';

export class USVATPolicy implements PolicyContract<USVATRule> {
  US_VAT = Symbol.for('@USVATPolicy');

  public getVAT(
    address: Address,
    asBusiness = false,
    inBusiness = true
  ): USVATRule {
    return new USVATRule(address, asBusiness, inBusiness);
  }

  public getType(): symbol {
    return this.US_VAT;
  }
}
