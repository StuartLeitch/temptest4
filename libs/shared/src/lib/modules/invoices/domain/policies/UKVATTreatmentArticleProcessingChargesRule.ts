import { TaxRuleContract } from '../contracts/TaxRuleContract';

/**
 * * Customer Categories:
 * * - Private individual (not VAT registered)
 * * - VAT-registered educational institution
 * * - VAT-registered charitable organisation (grant funding)
 * * - VAT-registered organisation with both charitable and business functions (many schools, some governments)
 * * - VAT-registered commercial organisation (i.e. pharmaceutical companies)
 *
 * * The place of supply is where the customer is established.
 * * - For UK business/non-business customers – UK VAT should be charged at the current standard rate of 20%.
 * * - For EU business customers – The supply will be outside the scope of UK VAT.
 * * - For EU non-business customers – UK VAT should be charged at the current standard rate of 20%.
 * * - For non-EU business customers – The supply will be outside the scope of UK VAT.
 * * - For non-EU non-business customers – The supply will be outside the scope of UK VAT.
 *
 * * Determining the location/place of establishment of the customer:
 * * - Billing address of the customer
 * *    - If VAT registered: VAT registration number
 * *    - If not VAT registered: Company number
 * * - Location of the bank
 *
 * * Determining the business status of the customer
 *
 */
export class UKVATTreatmentArticleProcessingChargesRule
  implements TaxRuleContract {
  public AsBusiness: boolean;
  public VATRegistered: boolean;
  public CountryCode: string;

  /**
   * * All available tax rules and their exceptions.
   * Taken from: http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
   */
  private VATRules = {
    // Belgium
    BE: { rate: 21 },
    // Bulgaria
    BG: { rate: 20 },
    // Czech Republic
    CZ: { rate: 21 },
    // Denmark
    DK: { rate: 25 },
    // Germany
    DE: { rate: 19 },
    // Estonia
    EE: { rate: 20 },
    // Ireland
    IE: { rate: 23 },
    // Greece
    EL: { rate: 24 },
    // Spain
    ES: { rate: 21 },
    // France
    FR: { rate: 20 },
    // Croatia
    HR: { rate: 25 },
    // Italy
    IT: { rate: 22 },
    // Cyprus
    CY: { rate: 19 },
    // Latvia
    LV: { rate: 21 },
    // Lithuania
    LT: { rate: 21 },
    // Luxembourg
    LU: { rate: 14 },
    // Hungary
    HU: { rate: 27 },
    // Malta
    MT: { rate: 18 },
    // Netherlands
    NL: { rate: 21 },
    // Austria
    AT: { rate: 20 },
    // Poland
    PL: { rate: 23 },
    // Portugal
    PT: { rate: 23 },
    // Romania
    RO: { rate: 19 },
    // Slovenia
    SI: { rate: 22 },
    // Slovakia
    SK: { rate: 20 },
    // Finland
    FI: { rate: 24 },
    // Sweden
    SE: { rate: 25 },
    // United Kingdom
    UK: { rate: 20 },
    // United Kingdom
    GB: { rate: 20 }
  };

  private VATNote = {
    TAX_TREATMENT_EU_AND_UK_TEMPLATE:
      'UK VAT applies to this invoice, based on the country of the payer. (VAT amount in GBP is {Vat/Rate} GBP, 1 GBP = {Rate} USD)',
    TAX_TREATMENT_REST_OF_THE_WORLD_TEMPLATE:
      'Outside the scope of UK VAT as per Article 44 of 2006/112/EC',
    TAX_EU_AND_UK_TREATMENT_VALUE: 'a6B0Y000000fyPVUAY',
    TAX_EU_ONLY_TREATMENT_VALUE: 'a6B0Y000000fyOuUAI',
    TAX_REST_OF_THE_WORLD_TREATMENT_VALUE: 'a6B0Y000000fyOyUAI',
    TAX_EU_AND_UK_TREATMENT_TEXT: 'UK Sale Services',
    TAX_EU_ONLY_TREATMENT_TEXT: 'EC Sale Services UK',
    TAX_REST_OF_THE_WORLD_TREATMENT_TEXT: 'Worldwide Sale Services',
    TAX_EU_AND_UK_TYPE_VALUE: 'a680Y0000000CvBQAU',
    TAX_EU_ONLY_TYPE_VALUE: 'a680Y0000000CvCQAU',
    TAX_REST_OF_THE_WORLD_TYPE_VALUE: 'a680Y0000000Cv8QAE',
    TAX_EU_AND_UK_TYPE_TEXT: 'Standard Rate UK',
    TAX_TYPE_ZERO_RATE_TEXT: 'Zero Rate UK',
    TAX_TYPE_EXEMPT_UK_TEXT: 'Exempt UK'
  };

  public constructor(
    countryCode: string,
    asBusiness = false,
    VATRegistered = true
  ) {
    this.CountryCode = countryCode;
    this.AsBusiness = asBusiness;
    this.VATRegistered = VATRegistered;
  }

  public getVAT(): number {
    const europeanCountriesCodes = Object.keys(this.VATRules);
    let VATRate = 0;

    console.info(this.CountryCode);

    if (europeanCountriesCodes.includes(this.CountryCode)) {
      VATRate = this.VATRules[this.CountryCode].rate;
      // institutions should have 0 vat
      if (!this.AsBusiness && !this.VATRegistered) {
        VATRate = this.VATRules.UK.rate;
      }
    }

    return VATRate;
  }

  public getVATNote(): any {
    const europeanCountriesCodes = Object.keys(this.VATRules);
    const VATNote = {
      template: '',
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

    if (!europeanCountriesCodes.includes(this.CountryCode)) {
      VATNote.template = this.VATNote.TAX_TREATMENT_REST_OF_THE_WORLD_TEMPLATE;
      VATNote.tax.treatment.value = this.VATNote.TAX_REST_OF_THE_WORLD_TREATMENT_VALUE;
      VATNote.tax.treatment.text = this.VATNote.TAX_REST_OF_THE_WORLD_TREATMENT_TEXT;
      VATNote.tax.type.value = this.VATNote.TAX_REST_OF_THE_WORLD_TYPE_VALUE;
      VATNote.tax.type.text = this.VATNote.TAX_TYPE_EXEMPT_UK_TEXT;
    } else if (
      europeanCountriesCodes.includes(this.CountryCode) &&
      this.CountryCode !== 'UK' &&
      this.CountryCode !== 'GB' &&
      this.VATRegistered
    ) {
      VATNote.template = this.VATNote.TAX_TREATMENT_REST_OF_THE_WORLD_TEMPLATE;
      VATNote.tax.treatment.value = this.VATNote.TAX_EU_ONLY_TREATMENT_VALUE;
      VATNote.tax.treatment.text = this.VATNote.TAX_EU_ONLY_TREATMENT_TEXT;
      VATNote.tax.type.value = this.VATNote.TAX_EU_ONLY_TYPE_VALUE;
      VATNote.tax.type.text = this.VATNote.TAX_TYPE_ZERO_RATE_TEXT;
    } else {
      VATNote.template = this.VATNote.TAX_TREATMENT_EU_AND_UK_TEMPLATE;
      VATNote.tax.treatment.value = this.VATNote.TAX_EU_AND_UK_TREATMENT_VALUE;
      VATNote.tax.treatment.text = this.VATNote.TAX_EU_AND_UK_TREATMENT_TEXT;
      VATNote.tax.type.value = this.VATNote.TAX_EU_AND_UK_TYPE_VALUE;
      VATNote.tax.type.text = this.VATNote.TAX_EU_AND_UK_TYPE_TEXT;
    }

    return VATNote;
  }
}
