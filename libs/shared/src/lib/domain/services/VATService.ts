import EuroVat from 'eu-vat';

import { PoliciesRegister } from '../../modules/invoices/domain/policies/PoliciesRegister';
import { UKVATTreatmentArticleProcessingChargesPolicy } from './../../modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';
import { USVATPolicy } from './../../modules/invoices/domain/policies/USVATPolicy';
import { Address as VATAddress } from '../../modules/invoices/domain/policies/Address';

const vat = new EuroVat();
const policiesRegister = new PoliciesRegister();

let VATPolicy: USVATPolicy | UKVATTreatmentArticleProcessingChargesPolicy;

export interface CheckVatResponse {
  countryCode: string;
  vatNumber: string;
  requestDate: Date;
  valid: boolean;
  name: string;
  address: string;
}

// !!! Ugly as fuck!
// TODO: Please reconsider this solution
if (process.env.TENANT_COUNTRY === 'US') {
  VATPolicy = new USVATPolicy();
} else {
  VATPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
}
policiesRegister.registerPolicy(VATPolicy);

export class VATService {
  public async getRates(countryCode?: string) {
    const rates = await vat.getRates(countryCode);
    return rates;
  }

  public calculateVAT(
    address: VATAddress,
    individualConfirmed: boolean,
    issueDate: Date
  ) {
    const calculateVAT = policiesRegister.applyPolicy(VATPolicy.getType(), [
      address,
      !individualConfirmed,
      individualConfirmed ? false : true,
      issueDate,
    ]);

    const VAT = calculateVAT.getVAT();
    return VAT;
  }

  public getVATNote(
    address: VATAddress,
    individualConfirmed: boolean,
    issueDate: Date
  ) {
    const calculateVAT = policiesRegister.applyPolicy(VATPolicy.getType(), [
      address,
      !individualConfirmed,
      individualConfirmed ? false : true,
      issueDate,
    ]);

    const VATNote = calculateVAT.getVATNote();
    return VATNote;
  }
}
