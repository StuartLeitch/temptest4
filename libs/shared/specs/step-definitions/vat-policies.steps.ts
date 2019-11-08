import {defineFeature, loadFeature} from 'jest-cucumber';

// import {Result} from '../../lib/core/Result';
// import {UniqueEntityID} from '../../src/lib/core/domain/UniqueEntityID';
import {
  Invoice,
  InvoiceStatus
} from '../../src/lib/modules/invoices/domain/Invoice';
import {MockInvoiceRepo} from '../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import {
  GetInvoiceDetailsUsecase,
  GetInvoiceDetailsContext
} from '../../src/lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import {Roles} from '../../src/lib/modules/users/domain/enums/Roles';

import {Payer} from '../../src/lib/modules/payers/domain/Payer';
import {PayerMap} from '../../src/lib/modules/payers/mapper/Payer';
// import {PayerName} from '../../src/lib/modules/payers/domain/PayerName';
// import {PayerType} from '../../src/lib/modules/payers/domain/PayerType';
import {MockPayerRepo} from '../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import {InvoiceMap} from './../../src/lib/modules/invoices/mappers/InvoiceMap';

import {PoliciesRegister} from '../../src/lib/modules/invoices/domain/policies/PoliciesRegister';
import {UKVATTreatmentOfHardCopyPublicationsPolicy} from '../../src/lib/modules/invoices/domain/policies/UKVATHardCopyPolicy';
import {UKVATTreatmentArticleProcessingChargesPolicy} from '../../src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';
import {VATTreatmentPublicationNotOwnedPolicy} from '../../src/lib/modules/invoices/domain/policies/VATTreatmentPublicationNotOwnedPolicy';

const feature = loadFeature('../features/vat-policies.feature', {
  loadRelativePath: true
});

const defaultContext: GetInvoiceDetailsContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
  const mockPayerRepo: MockPayerRepo = new MockPayerRepo();
  const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(
    mockInvoiceRepo
  );

  // let result: Result<Invoice>;
  let payer: Payer;
  let invoice: Invoice;

  let HardCopyPolicy: UKVATTreatmentOfHardCopyPublicationsPolicy;
  let APCPolicy: UKVATTreatmentArticleProcessingChargesPolicy;
  let PublicationNotOwnedPolicy: VATTreatmentPublicationNotOwnedPolicy;

  let policiesRegister: PoliciesRegister;
  let calculateVAT: any;
  let countryCode: string;
  let netValue: number;
  let invoiceId: string;
  let payerId: string;

  beforeEach(() => {
    payerId = 'test-payer';
    payer = PayerMap.toDomain({
      id: payerId,
      name: 'foo',
      surname: 'bar',
      type: 'individual'
    });
    mockPayerRepo.save(payer);

    invoiceId = 'test-invoice';
    invoice = InvoiceMap.toDomain({
      id: invoiceId,
      status: InvoiceStatus.DRAFT,
      payerId: payer.payerId.id.toString()
    });
    mockInvoiceRepo.save(invoice);
    policiesRegister = new PoliciesRegister();
  });

  afterEach(() => {
    // do nothing yet
  });

  test('UK VAT treatment of APC for an UK individual', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer will pay for an APC', () => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();

      policiesRegister.registerPolicy(APCPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = false;
        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }

        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
          countryCode,
          asBusiness,
          VATRegistered
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of APC for an UK institution', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer will pay for an APC', () => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();

      policiesRegister.registerPolicy(APCPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = true;
        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }

        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
          countryCode,
          asBusiness,
          VATRegistered
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of APC for an EU individual', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer will pay for an APC', () => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();

      policiesRegister.registerPolicy(APCPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = false;
        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }

        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
          countryCode,
          asBusiness,
          VATRegistered
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of APC for an EU institution', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer will pay for an APC', () => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();

      policiesRegister.registerPolicy(APCPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = true;
        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }
        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
          countryCode,
          asBusiness,
          VATRegistered
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of APC for an Non-EU individual', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer will pay for an APC', () => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();

      policiesRegister.registerPolicy(APCPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = false;

        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }

        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
          countryCode,
          asBusiness,
          VATRegistered
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of APC for an Non-EU institution', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer will pay for an APC', () => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();

      policiesRegister.registerPolicy(APCPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = true;

        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }

        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
          countryCode,
          asBusiness,
          VATRegistered
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of publication not owned by Hindawi', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and(
      'The payer wants to purchase a publication NOT owned by Hindawi',
      () => {
        PublicationNotOwnedPolicy = new VATTreatmentPublicationNotOwnedPolicy();

        policiesRegister.registerPolicy(PublicationNotOwnedPolicy);
      }
    );

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const VATRegistered = false;
        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }
        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(
          PublicationNotOwnedPolicy.getType(),
          [countryCode, asBusiness, VATRegistered]
        );

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });

  test('UK VAT treatment of the supply of hard copy publications', ({
    given,
    when,
    and,
    then
  }) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and('The payer wants to purchase a hard copy', () => {
      HardCopyPolicy = new UKVATTreatmentOfHardCopyPublicationsPolicy();

      policiesRegister.registerPolicy(HardCopyPolicy);
    });

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        const asBusiness = false;
        const invoiceResult = await getInvoiceDetailsUsecase.execute(
          {
            invoiceId
          },
          defaultContext
        );

        if (invoiceResult.isRight()) {
          invoice = invoiceResult.value.getValue();
        }

        netValue = parseInt(invoiceNetValue, 10);
        // invoice.netAmount = netValue;

        calculateVAT = policiesRegister.applyPolicy(HardCopyPolicy.getType(), [
          countryCode,
          asBusiness
        ]);

        const VAT = calculateVAT.getVAT();
        // invoice.addTax(VAT);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        // expect(invoice.totalAmount).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });
});
