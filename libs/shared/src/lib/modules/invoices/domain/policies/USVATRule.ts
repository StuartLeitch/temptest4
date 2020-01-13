import { TaxRuleContract } from '../contracts/TaxRuleContract';
import pennsylvaniaPostalCodes from './pennsylvania-postal-codes.json';
import { Address } from './Address';

export class USVATRule implements TaxRuleContract {
  public AsBusiness: boolean;
  public InBusiness: boolean;
  public CountryCode: string;
  public PostalCode: string;
  public StateCode: string;

  private AlleghenyCountyCodes: string[] = pennsylvaniaPostalCodes.Allegheny;
  private PhiladelphiaCountyCodes: string[] =
    pennsylvaniaPostalCodes.Philadelphia;

  public constructor(address: Address, asBusiness = false, inBusiness = true) {
    this.AsBusiness = asBusiness;
    this.InBusiness = inBusiness;
    this.CountryCode = address.countryCode;
    this.PostalCode = address.postalCode;
    this.StateCode = address.stateCode;
  }

  public getVAT(): number {
    // TODO: Calculate the VAT value based on State
    if (this.StateCode && this.StateCode === 'PA') {
      if (
        this.PostalCode &&
        this.PhiladelphiaCountyCodes.includes(this.PostalCode)
      )
        return 8;
      if (
        this.PostalCode &&
        this.AlleghenyCountyCodes.includes(this.PostalCode)
      )
        return 7;
      return 6;
    }
    return 0;
  }

  public getVATNote(): any {
    const VATNote = {
      template:
        'The service recipient is liable to pay the entire amount of any Sales, VAT or GST tax. This invoice amount is net of any service tax. Any such taxes has to be borne by the customer and paid directly to the appropriate tax authorities. GeoScienceWorld is a not for profit organization and does not allow deductions of any taxes from its invoice amount.',
      tax: {
        treatment: {
          value: '',
          text: ''
        },
        type: {
          value: '',
          text: ''
        }
      }
    };

    return VATNote;
  }
}
