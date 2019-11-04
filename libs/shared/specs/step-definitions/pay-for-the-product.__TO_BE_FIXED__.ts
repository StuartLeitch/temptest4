import {defineFeature, loadFeature} from 'jest-cucumber';

import {Result} from '../../src/lib/core/logic/Result';
import {UniqueEntityID} from '../../src/lib/core/domain/UniqueEntityID';
import {Roles} from '../../src/lib/modules/users/domain/enums/Roles';

import {
  Invoice,
  InvoiceStatus
} from '../../src/lib/modules/invoices/domain/Invoice';
import {
  UpdateInvoiceDetailsUsecase,
  UpdateInvoiceContext
} from '../../src/lib/modules/invoices/usecases/updateInvoice/updateInvoiceDetails';

import {MockInvoiceRepo} from '../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import {MockPayerRepo} from '../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import {
  Payer /*, PayerCollection*/
} from '../../src/lib/modules/payers/domain/Payer';
import {PayerName} from '../../src/lib/modules/payers/domain/PayerName';
import {PayerType} from '../../src/lib/modules/payers/domain/PayerType';

const feature = loadFeature('./specs/features/pay-for-the-product.feature');

const defaultContext: UpdateInvoiceContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  let mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
  let mockPayerRepo: MockPayerRepo = new MockPayerRepo();
  let result: Result<Invoice>;

  let payerId;
  let invoiceId;

  let usecase: UpdateInvoiceDetailsUsecase = new UpdateInvoiceDetailsUsecase(
    mockInvoiceRepo,
    mockPayerRepo
  );

  beforeEach(() => {
    payerId = 'test-payer';
    const payer = Payer.create(
      {
        name: PayerName.create('foo').getValue(),
        surname: PayerName.create('bar').getValue(),
        type: PayerType.create('individual').getValue()
      },
      new UniqueEntityID(payerId)
    ).getValue();
    mockPayerRepo.save(payer);

    invoiceId = 'test-invoice';
    const invoice = Invoice.create(
      {
        status: InvoiceStatus.DRAFT,
        payerId: payer.payerId
      },
      new UniqueEntityID(invoiceId)
    ).getValue();
    mockInvoiceRepo.save(invoice);
  });

  test('Select individual payment', ({given, when, then}) => {
    given('As a Payer updating Transaction Details', () => {});

    when(/^I select \"(\w+)"$/, async (payerType: string) => {
      result = await usecase.execute(
        {
          invoiceId,
          payerType
        },
        defaultContext
      );
    });

    then('the invoice should be updated', () => {
      expect(result.isSuccess).toBe(true);
    });
  });
});
