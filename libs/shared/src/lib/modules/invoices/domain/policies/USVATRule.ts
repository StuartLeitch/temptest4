import { TaxRuleContract } from '../contracts/TaxRuleContract';

export class USVATRule implements TaxRuleContract {
  public AsBusiness: boolean;
  public InBusiness: boolean;
  public CountryCode: string;

  public constructor(
    countryCode: string,
    asBusiness = false,
    inBusiness = true
  ) {
    this.AsBusiness = asBusiness;
    this.InBusiness = inBusiness;
    this.CountryCode = countryCode;
  }

  public getVAT(): number {
    // TODO: Calculate the VAT value based on State
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
