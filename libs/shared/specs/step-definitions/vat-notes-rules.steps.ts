import { defineFeature, loadFeature } from 'jest-cucumber';

import { PoliciesRegister } from '../../src/lib/modules/invoices/domain/policies/PoliciesRegister';
import { UKVATTreatmentArticleProcessingChargesPolicy } from '../../src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';

const feature = loadFeature('../features/vat-notes-rules.feature', {
  loadRelativePath: true
});

defineFeature(feature, test => {
  let APCPolicy: UKVATTreatmentArticleProcessingChargesPolicy;

  let policiesRegister: PoliciesRegister;
  let calculateVAT: any;
  let countryCode: string;
  let VATNote: any;
  beforeEach(() => {
    policiesRegister = new PoliciesRegister();
  });

  test('VAT Notes for an Non-EU individual', ({ given, when, and, then }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;

      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);
    });

    when('The VAT note is generated', async (invoiceNetValue: string) => {
      const asBusiness = false;
      const VATRegistered = false;

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        countryCode,
        asBusiness,
        VATRegistered
      ]);

      VATNote = calculateVAT.getVATNote();
    });

    then(
      /^VAT note template should be "([\d\w\W \/{}=.()]+)"$/,
      async (expectedVATNoteTemplate: string) => {
        expect(VATNote.template).toBe(expectedVATNoteTemplate);
      }
    );

    and(
      /^VAT note tax treatment value should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentValue => {
        expect(VATNote.tax.treatment.value).toBe(expectedNoteTaxTreatmentValue);
      }
    );

    and(
      /^VAT note tax treatment text should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentText => {
        expect(VATNote.tax.treatment.text).toBe(expectedNoteTaxTreatmentText);
      }
    );

    and(
      /^VAT note tax type value should be "([\w ]+)"$/,
      async expectedNoteTaxTypeValue => {
        expect(VATNote.tax.type.value).toBe(expectedNoteTaxTypeValue);
      }
    );

    and(
      /^VAT note tax type text should be "([\w ]+)"$/,
      async expectedNoteTaxTypeText => {
        expect(VATNote.tax.type.text).toBe(expectedNoteTaxTypeText);
      }
    );
  });

  test('VAT Notes for an Non-EU institution', ({ given, when, and, then }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;

      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);
    });

    when('The VAT note is generated', async (invoiceNetValue: string) => {
      const asBusiness = true;
      const VATRegistered = true;

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        countryCode,
        asBusiness,
        VATRegistered
      ]);

      VATNote = calculateVAT.getVATNote();
    });

    then(
      /^VAT note template should be "([\d\w\W \/{}=.()]+)"$/,
      async (expectedVATNoteTemplate: string) => {
        expect(VATNote.template).toBe(expectedVATNoteTemplate);
      }
    );

    and(
      /^VAT note tax treatment value should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentValue => {
        expect(VATNote.tax.treatment.value).toBe(expectedNoteTaxTreatmentValue);
      }
    );

    and(
      /^VAT note tax treatment text should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentText => {
        expect(VATNote.tax.treatment.text).toBe(expectedNoteTaxTreatmentText);
      }
    );

    and(
      /^VAT note tax type value should be "([\w ]+)"$/,
      async expectedNoteTaxTypeValue => {
        expect(VATNote.tax.type.value).toBe(expectedNoteTaxTypeValue);
      }
    );

    and(
      /^VAT note tax type text should be "([\w ]+)"$/,
      async expectedNoteTaxTypeText => {
        expect(VATNote.tax.type.text).toBe(expectedNoteTaxTypeText);
      }
    );
  });

  test('VAT Notes for an EU institution', ({ given, when, and, then }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;

      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);
    });

    when('The VAT note is generated', async (invoiceNetValue: string) => {
      const asBusiness = true;
      const VATRegistered = true;

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        countryCode,
        asBusiness,
        VATRegistered
      ]);

      VATNote = calculateVAT.getVATNote();
    });

    then(
      /^VAT note template should be "([\d\w\W \/{}=.()]+)"$/,
      async (expectedVATNoteTemplate: string) => {
        expect(VATNote.template).toBe(expectedVATNoteTemplate);
      }
    );

    and(
      /^VAT note tax treatment value should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentValue => {
        expect(VATNote.tax.treatment.value).toBe(expectedNoteTaxTreatmentValue);
      }
    );

    and(
      /^VAT note tax treatment text should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentText => {
        expect(VATNote.tax.treatment.text).toBe(expectedNoteTaxTreatmentText);
      }
    );

    and(
      /^VAT note tax type value should be "([\w ]+)"$/,
      async expectedNoteTaxTypeValue => {
        expect(VATNote.tax.type.value).toBe(expectedNoteTaxTypeValue);
      }
    );

    and(
      /^VAT note tax type text should be "([\w ]+)"$/,
      async expectedNoteTaxTypeText => {
        expect(VATNote.tax.type.text).toBe(expectedNoteTaxTypeText);
      }
    );
  });

  test('VAT Notes for an EU individual', ({ given, when, and, then }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;

      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);
    });

    when('The VAT note is generated', async (invoiceNetValue: string) => {
      const asBusiness = false;
      const VATRegistered = false;

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        countryCode,
        asBusiness,
        VATRegistered
      ]);

      VATNote = calculateVAT.getVATNote();
    });

    then(
      /^VAT note template should be "([\d\w\W \/{}=.()]+)"$/,
      async (expectedVATNoteTemplate: string) => {
        expect(VATNote.template).toBe(expectedVATNoteTemplate);
      }
    );

    and(
      /^VAT note tax treatment value should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentValue => {
        expect(VATNote.tax.treatment.value).toBe(expectedNoteTaxTreatmentValue);
      }
    );

    and(
      /^VAT note tax treatment text should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentText => {
        expect(VATNote.tax.treatment.text).toBe(expectedNoteTaxTreatmentText);
      }
    );

    and(
      /^VAT note tax type value should be "([\w ]+)"$/,
      async expectedNoteTaxTypeValue => {
        expect(VATNote.tax.type.value).toBe(expectedNoteTaxTypeValue);
      }
    );

    and(
      /^VAT note tax type text should be "([\w ]+)"$/,
      async expectedNoteTaxTypeText => {
        expect(VATNote.tax.type.text).toBe(expectedNoteTaxTypeText);
      }
    );
  });

  test('VAT Notes for an UK individual', ({ given, when, and, then }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;

      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);
    });

    when('The VAT note is generated', async (invoiceNetValue: string) => {
      const asBusiness = false;
      const VATRegistered = false;

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        countryCode,
        asBusiness,
        VATRegistered
      ]);

      VATNote = calculateVAT.getVATNote();
    });

    then(
      /^VAT note template should be "([\d\w\W \/{}=.()]+)"$/,
      async (expectedVATNoteTemplate: string) => {
        expect(VATNote.template).toBe(expectedVATNoteTemplate);
      }
    );

    and(
      /^VAT note tax treatment value should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentValue => {
        expect(VATNote.tax.treatment.value).toBe(expectedNoteTaxTreatmentValue);
      }
    );

    and(
      /^VAT note tax treatment text should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentText => {
        expect(VATNote.tax.treatment.text).toBe(expectedNoteTaxTreatmentText);
      }
    );

    and(
      /^VAT note tax type value should be "([\w ]+)"$/,
      async expectedNoteTaxTypeValue => {
        expect(VATNote.tax.type.value).toBe(expectedNoteTaxTypeValue);
      }
    );

    and(
      /^VAT note tax type text should be "([\w ]+)"$/,
      async expectedNoteTaxTypeText => {
        expect(VATNote.tax.type.text).toBe(expectedNoteTaxTypeText);
      }
    );
  });

  test('VAT Notes for an UK institution', ({ given, when, and, then }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;

      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);
    });

    when('The VAT note is generated', async (invoiceNetValue: string) => {
      const asBusiness = true;
      const VATRegistered = true;

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        countryCode,
        asBusiness,
        VATRegistered
      ]);

      VATNote = calculateVAT.getVATNote();
    });

    then(
      /^VAT note template should be "([\d\w\W \/{}=.()]+)"$/,
      async (expectedVATNoteTemplate: string) => {
        expect(VATNote.template).toBe(expectedVATNoteTemplate);
      }
    );

    and(
      /^VAT note tax treatment value should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentValue => {
        expect(VATNote.tax.treatment.value).toBe(expectedNoteTaxTreatmentValue);
      }
    );

    and(
      /^VAT note tax treatment text should be "([\w ]+)"$/,
      async expectedNoteTaxTreatmentText => {
        expect(VATNote.tax.treatment.text).toBe(expectedNoteTaxTreatmentText);
      }
    );

    and(
      /^VAT note tax type value should be "([\w ]+)"$/,
      async expectedNoteTaxTypeValue => {
        expect(VATNote.tax.type.value).toBe(expectedNoteTaxTypeValue);
      }
    );

    and(
      /^VAT note tax type text should be "([\w ]+)"$/,
      async expectedNoteTaxTypeText => {
        expect(VATNote.tax.type.text).toBe(expectedNoteTaxTypeText);
      }
    );
  });
});
